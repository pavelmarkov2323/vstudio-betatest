const express = require('express');
const router = express.Router();
const { User } = require('../models/user'); // Подключаем модель

// API для обновления баланса
router.post('/update-balance', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  const { amount } = req.body;
  if (typeof amount !== 'number') {
    return res.status(400).json({ message: 'Неверный формат баланса' });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.session.userId },
      { $set: { balance: amount } },
      { new: true }
    ).select('balance');

    res.json({ message: 'Баланс обновлён', balance: updatedUser.balance });
  } catch (err) {
    console.error('Ошибка обновления баланса:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;