const express = require('express');
const router = express.Router();
const PromoCode = require('./models/promocode');
const { User } = require('./models/user');

// POST /api/promo/activate
router.post('/activate', async (req, res) => {
    const code = req.body.code;
    const userId = req.session.userId;

    if (!userId || !code) {
        return res.status(400).json({ success: false, message: 'Не авторизован или промокод пустой' });
    }

    try {
        const promo = await PromoCode.findOne({ code: code.toUpperCase() });
        if (!promo) return res.status(404).json({ success: false, message: 'Промокод не найден' });

        // Проверка срока действия
        if (promo.expiresAt && promo.expiresAt < new Date()) {
            return res.status(410).json({ success: false, message: 'Срок действия истёк' });
        }

        // Получаем пользователя
        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ success: false, message: 'Пользователь не найден' });

        // Проверка, не превышено ли число активаций
        if (promo.maxActivations > 0 && promo.activatedBy.length >= promo.maxActivations) {
            return res.status(409).json({ success: false, message: 'Лимит активаций исчерпан' });
        }

        // Проверка — активировал ли пользователь
        if (promo.activatedBy.includes(user._id)) {
            return res.status(403).json({ success: false, message: 'Вы уже активировали этот промокод' });
        }

        // Начисляем награду
        user.balance += promo.reward;
        await user.save();

        // Отмечаем, что пользователь активировал этот код
        promo.activatedBy.push(user._id);
        await promo.save();

        return res.json({ success: true, message: `Промокод успешно активирован. Начислено ${promo.reward}₽` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;
