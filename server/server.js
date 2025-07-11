require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const { User } = require('./models/user');

app.use(express.json());
app.use(cors());

app.set('trust proxy', true);

// Сессионная система с шифрованием
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 // 1 день
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 день
    httpOnly: true,
  }
}));

// Routes пути к логике разных скриптов
const authRouter = require('./routes/auth');
app.use('/api', authRouter);

const profileRouter = require('./routes/user');
app.use('/api', profileRouter);

const balanceRouter = require('./routes/balance');
app.use('/api', balanceRouter);

const promoRoutes = require('./routes/promo');
app.use('/api/promo', promoRoutes);

const subscriptionsRouter = require('./routes/subscriptions');
app.use('/api/subscriptions', subscriptionsRouter);

const referralRoutes = require('./routes/referal');
app.use('/api/referral', referralRoutes);

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

// Подключение к MongoDB
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB подключен');
    app.listen(PORT, () => console.log(`Сервер запущен на порту: ${PORT}`));
  } catch (err) {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  }
}

start();