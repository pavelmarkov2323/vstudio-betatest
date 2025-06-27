const mongoose = require('mongoose');

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
  balance: { type: Number, default: 0 },
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
