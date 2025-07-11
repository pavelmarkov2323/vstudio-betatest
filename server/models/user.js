const mongoose = require('mongoose');
const crypto = require('crypto');

// Схема-счётчик для генерации userId
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

// Схема пользователя
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  firstName: String,
  lastName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/dqceexk1h/image/upload/v1750689301/default.png'
  },
  bio: { type: String, default: '' },
  status: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },
  subscriptions: [
    {
      program: { type: String, required: true },
      plan: { type: String, required: true },
      price: { type: Number, required: true },
      purchasedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, required: true }
    }
  ],
  referral_code: { type: String, unique: true, default: function() {
    // Генерируем уникальный 6-символьный код (буквы и цифры)
    return crypto.randomBytes(3).toString('hex');
  }},
  activated_referral_code: { type: String, default: '' },
  referrals: { type: Number, default: 0 },
  referral_earnings: { type: Number, default: 0 },
  referral_activated_users: { type: [Number], default: [] }, // userId активировавших
  gender: { type: String, enum: ['Male', 'Female', ''], default: '' },
  birth: {
    day: Number,
    month: String,
    year: Number
  },
  country: { type: String, default: '' },
  ip: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Middleware: генерация userId из счётчика
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'userId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.userId = counter.seq;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

const User = mongoose.model('User', userSchema);

module.exports = { User, Counter };
