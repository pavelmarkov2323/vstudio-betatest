const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

// Привязка к планам, чтобы проверять цену и считать дату окончания
const plans = {
  '1m': { months: 1, price: 80 },
  '3m': { months: 3, price: 240 },
  '6m': { months: 6, price: 480 },
  '12m': { months: 12, price: 960 }
};

router.post('/purchase', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Не авторизован' });

  const { program, plan, price } = req.body;

  if (!program || !plan || !price) {
    return res.status(400).json({ message: 'Неверные данные подписки' });
  }

  // Проверяем, что план существует и цена совпадает
  const planData = plans[plan];
  if (!planData || planData.price !== price) {
    return res.status(400).json({ message: 'Некорректный тарифный план или цена' });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    // Проверка баланса
    if (user.balance < price) {
      return res.status(400).json({ message: 'Недостаточно средств на балансе' });
    }

    // Вычитаем сумму с баланса
    user.balance -= price;

    // Считаем дату окончания подписки
    const now = new Date();
    const expiresAt = new Date(now.setMonth(now.getMonth() + planData.months));

    // Добавляем подписку
    user.subscriptions.push({
      program,
      plan,
      price,
      purchasedAt: new Date(),
      expiresAt
    });

    // Обновляем isPremium, если нужно
    user.isPremium = true;

    await user.save();

    res.json({ message: 'Подписка оформлена', balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;