const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

// Получить данные рефералов текущего пользователя
router.get('/info', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Не авторизован' });

  try {
    const user = await User.findOne({ userId: req.session.userId });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    const ratePerUser = user.isPremium ? 3 : 1;

    res.json({
      totalEarned: user.referral_earnings,
      ratePerUser,
      invitedUsers: user.referrals,
      activatedReferralCode: user.activated_referral_code
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Активация реферального кода
router.post('/activate', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Не авторизован' });

  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Введите корректный код' });
  }

  try {
    const currentUser = await User.findOne({ userId: req.session.userId });
    if (!currentUser) return res.status(404).json({ message: 'Пользователь не найден' });

    // Нельзя активировать код самому себе
    if (currentUser.referral_code === code) {
      return res.status(400).json({ message: 'Нельзя активировать свой код' });
    }

    // Проверяем, активирован ли уже код
    if (currentUser.activated_referral_code) {
      return res.status(400).json({ message: 'Код уже активирован' });
    }

    // Ищем пользователя, чей код активируем
    const refUser = await User.findOne({ referral_code: code });
    if (!refUser) {
      return res.status(404).json({ message: 'Код не найден' });
    }

    // Проверяем, не активировал ли уже текущий пользователь чей-то код (защита)
    if (currentUser.activated_referral_code) {
      return res.status(400).json({ message: 'Код уже активирован ранее' });
    }

    // Обновляем реферала (тот, кто пригласил)
    const refUserRate = refUser.isPremium ? 3 : 1;
    const refUserEarningsIncrement = refUserRate;

    // Обновляем данные реферала:
    await User.updateOne(
      { userId: refUser.userId },
      {
        $inc: { referrals: 1, referral_earnings: refUserEarningsIncrement, balance: refUserEarningsIncrement },
        $push: { referral_activated_users: currentUser.userId }
      }
    );

    // Обновляем текущего пользователя:
    currentUser.activated_referral_code = code;
    currentUser.referral_earnings += 3; // начисляем 3 за активацию (как в условии)
    currentUser.balance += 3;

    await currentUser.save();

    res.json({ message: 'Код успешно активирован', newBalance: currentUser.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;