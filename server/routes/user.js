const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary'); // путь поправь если нужно
const upload = multer({ storage });
const { User } = require('../models/user');

// Получение данных пользователя по username (GET)
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (err) {
    console.error('Ошибка получения профиля:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Загрузка аватара (требует авторизации)
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });

    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    user.avatar = req.file.path;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление биографии (требует авторизации)
router.post('/update-bio', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  const { bio } = req.body;
  if (typeof bio !== 'string' || bio.length > 500) {
    return res.status(400).json({ message: 'Неверная биография' });
  }

  try {
    await User.updateOne({ userId: req.session.userId }, { bio });
    res.json({ message: 'Биография обновлена' });
  } catch (err) {
    console.error('Ошибка обновления биографии:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление профиля (требует авторизации)
router.post('/update-profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  const { firstName, lastName, gender, birth, country } = req.body;

  if (typeof firstName !== 'string' || typeof lastName !== 'string' ||
      !['Male', 'Female', ''].includes(gender) ||
      typeof birth !== 'object' ||
      !birth.day || !birth.month || !birth.year ||
      typeof country !== 'string') {
    return res.status(400).json({ message: 'Неверные данные' });
  }

  const updateData = {
    firstName,
    lastName,
    gender: ['Male', 'Female'].includes(gender) ? gender : '',
    birth,
    country
  };

  try {
    await User.updateOne({ userId: req.session.userId }, updateData);
    res.json({ message: 'Профиль обновлён' });
  } catch (err) {
    console.error('Ошибка обновления профиля:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;