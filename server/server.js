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


// API для загрузки аватара, система аватаров
const multer = require('multer');
const fs = require('fs');

// Папка для хранения аватаров
const avatarsDir = path.join(__dirname, '../public/uploads/avatars');
app.use('/uploads/avatars', express.static(avatarsDir)); // Раздаём статические файлы из этой папки по пути /uploads/avatars

// Создаём папку, если нет
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Конфиг multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    // Название файла — userId + расширение
    const ext = path.extname(file.originalname);
    cb(null, req.session.userId + ext);
  }
});

const upload = multer({ storage });

// Защищённый роут для загрузки аватара
app.post('/api/upload-avatar', upload.single('avatar'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }

  try {
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await User.updateOne({ userId: req.session.userId }, { avatar: avatarPath });
    res.json({ message: 'Аватар обновлён', avatar: avatarPath });
  } catch (err) {
    console.error('Ошибка загрузки аватара:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// API для смены биографии
app.post('/api/update-bio', async (req, res) => {
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


// API для получения данных пользователя по username (GET)
app.get('/api/profile/:username', async (req, res) => {
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
  avatar: { type: String, default: '/assets/images/avatar/default.png' }, // путь к аватару
  bio: { type: String, default: '' },
  status: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});



// Перед сохранением нового пользователя увеличиваем счётчик userId
userSchema.pre('save', async function (next) {
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
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username уже используется' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email уже используется' });
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



// Сброс пароля и отправка на почту
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const resetTokens = {}; // В реальном проекте храни в MongoDB с expiry

// Сброс пароля, смена пароля
app.post('/api/request-reset', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: 'Если такой email есть, отправим ссылку' });

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens[token] = { userId: user.userId, expires: Date.now() + 1000 * 60 * 30 }; // 30 мин

  const resetLink = `https://vstudio-betatest-production.up.railway.app/reset-password.html?token=${token}`;

  // Настройка отправки почты
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your password',
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; color: #333;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <h2 style="color: #333;">🔐 <strong>Password reset</strong></h2>
        
        <p style="margin-top: 20px;">
          You receive this e-mail because you have requested the reinitialization of your account password at the Database of Córdoba Music Group.
        </p>

        <p>This link will be valid for <strong>30 min</strong>. If the link expires before you have been able to reinitialize your password, you can request a new link using the password recovery form.</p>

        <p>If you did not request a password reset, you can safely ignore this message.</p>

        <p style="margin-top: 30px;">Please click the button below to reset your password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background-color: #1a73e8; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
        </div>

        <p>If you have any questions, please contact customer support: <a href="mailto:support@valeyevstudio.com">support@valeyevstudio.com</a></p>

        <p style="margin-top: 40px;">
          <strong>The ValeyevStudio team</strong><br />
          <em>be unique with your music!</em>
        </p>
      </div>
    </div>
  `
  });
  res.json({ message: 'Письмо отправлено, если email существует' });
});

// Обработка смены пароля по токену
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const data = resetTokens[token];
  if (!data || Date.now() > data.expires) {
    return res.status(400).json({ message: 'Ссылка истекла или недействительна' });
  }

  // Получаем пользователя из БД
  const user = await User.findOne({ userId: data.userId });
  if (!user) {
    return res.status(400).json({ message: 'Пользователь не найден' });
  }

  // Проверяем, совпадает ли новый пароль с текущим
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return res.status(400).json({ message: 'Новый пароль не должен совпадать со старым' });
  }

  // Хэшируем новый пароль и обновляем
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ userId: data.userId }, { password: hashedPassword });

  delete resetTokens[token]; // Удаляем использованный токен

  res.json({ message: 'Пароль успешно изменён' });
});


// Запуск сервера на порту из .env или 3000 по умолчанию
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту: ${PORT}`));
