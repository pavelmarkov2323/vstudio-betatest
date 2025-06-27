const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const resetTokens = {}; // В реальном проекте храни в MongoDB с expiry
const { User } = require('../models/user');

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
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
        const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket.remoteAddress;

        // Создаём и сохраняем пользователя в базе
        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            ip 
        });

        newUser.ip = ip;
        await newUser.save();
        res.status(201).json({ message: 'Пользователь создан', userId: newUser.userId });

    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// API для авторизации
router.post('/login', async (req, res) => {
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
        
        // Обновляем IP при входе
        const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket.remoteAddress;
        await User.updateOne({ userId: user.userId }, { ip });

        res.json({ message: 'Успешный вход', userId: user.userId, username: user.username });

    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// Выход из аккаунта
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка выхода' });
        }
        res.clearCookie('connect.sid'); // Очистка cookie сессии
        res.json({ message: 'Выход успешен' });
    });
});

// Сброс пароля, смена пароля и отправка на почту
router.post('/request-reset', async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'Если такой email есть, отправим ссылку' });

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens[token] = { userId: user.userId, expires: Date.now() + 1000 * 60 * 30 }; // 30 мин

    const resetLink = `https://vstudio-betatest-production.up.railway.app/reset-password.html?token=${token}`;

    // Настройка отправки письма с уникальный токеном для восстановления пароля
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
          You receive this e-mail because you have requested the reinitialization of your account password at the Database of ValeyevStudio.
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
router.post('/reset-password', async (req, res) => {
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

module.exports = router;