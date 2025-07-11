const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

// Получить данные по реферальной системе для текущего пользователя
router.get('/referral-info', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Не авторизован' });

  try {
    const user = await User.findOne({ userId: req.session.userId }).select('referral_code activated_referral_code referrals referral_earnings isPremium balance');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    const rate = user.isPremium ? 3 : 1;

    res.json({
      referral_code: user.referral_code,
      activated_referral_code: user.activated_referral_code,
      referrals: user.referrals,
      referral_earnings: user.referral_earnings,
      rate_per_user: rate,
      balance: user.balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Активация реферального кода
router.post('/activate', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Не авторизован' });

  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Неверный код' });
  }

  try {
    const user = await User.findOne({ userId: req.session.userId });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (user.activated_referral_code) {
      return res.status(400).json({ message: 'Реферальный код уже активирован' });
    }

    if (code === user.referral_code) {
      return res.status(400).json({ message: 'Нельзя активировать собственный код' });
    }

    const inviter = await User.findOne({ referral_code: code });
    if (!inviter) return res.status(404).json({ message: 'Реферальный код не найден' });

    // Начисления
    const inviteeBonus = 3; // на баланс пригласившего
    const inviterBonus = inviter.isPremium ? 3 : 1;

    // Обновляем пригласившего
    inviter.referrals += 1;
    inviter.referral_earnings += inviterBonus;
    inviter.balance += inviterBonus;
    await inviter.save();

    // Обновляем приглашаемого
    user.activated_referral_code = code;
    user.balance += inviteeBonus;
    await user.save();

    res.json({ message: `Реферальный код активирован, на баланс зачислено ${inviteeBonus}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;