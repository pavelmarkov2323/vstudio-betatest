require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

// Сессионная система с шифрованием
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 день
    httpOnly: true,
  }
}));

// Раздача статических файлов (html, css, js) из корня проекта
app.use(express.static(path.join(__dirname, '..')));

// Обработка корневого запроса — отдаёт index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Обработка профиля по username — отдаёт профильный HTML файл
app.get('/profile/:username', (req, res) => {
  res.sendFile(path.join(__dirname, '../profile.html'));
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB подключен'))
  .catch(err => {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1); // Выходим, если подключение не удалось
  });

// Схема-счётчик для генерации userId
const counterSchema = new mongoose.Schema({
  _id: String, // Название счётчика, например "userId"
  seq: { type: Number, default: 0 } // Текущая последовательность
});
const Counter = mongoose.model('Counter', counterSchema);

// Схема пользователя с дополнительным полем userId
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true }, // Наш числовой ID пользователя
  firstName: String,
  lastName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

// Перед сохранением нового пользователя увеличиваем счётчик userId
userSchema.pre('save', async function(next) {
  if (this.isNew) { // Только для новых документов
    try {
      // Находим и увеличиваем счётчик в коллекции Counter
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'userId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // upsert создаёт запись, если её нет
      );
      this.userId = counter.seq; // Присваиваем userId из счётчика
      next();
    } catch (err) {
      next(err); // Передаём ошибку в следующий middleware
    }
  } else {
    next();
  }
});

const User = mongoose.model('User', userSchema);

// Регистрация нового пользователя
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    // Проверяем, существует ли уже пользователь с таким username или email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username или Email уже используется' });
    }

    // Хэшируем пароль для безопасности
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём и сохраняем пользователя в базе
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'Пользователь создан', userId: newUser.userId });

  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});


// POST /api/login — авторизация
app.post('/api/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    // Ищем пользователя по username или email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    // Успешный вход — возвращаем ответ (позже здесь можно добавить JWT)
    res.json({ message: 'Успешный вход', userId: user.userId, username: user.username });

  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});


// API для получения данных пользователя по username
app.post('/api/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    // Сохраняем данные пользователя в сессии
    req.session.userId = user.userId;
    req.session.username = user.username;

    res.json({ message: 'Успешный вход', userId: user.userId, username: user.username });

  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});


// API для получения текущего пользователя по сессии
app.get('/api/current-user', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  User.findOne({ userId: req.session.userId }).select('-password -__v')
    .then(user => {
      if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
      res.json(user);
    })
    .catch(() => res.status(500).json({ message: 'Ошибка сервера' }));
});


// Выход из аккаунта
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка выхода' });
    }
    res.clearCookie('connect.sid'); // Очистка cookie сессии
    res.json({ message: 'Выход успешен' });
  });
});


// Запуск сервера на порту из .env или 3000 по умолчанию
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту: ${PORT}`));