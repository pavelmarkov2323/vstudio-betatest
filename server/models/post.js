const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});

// Используем уже созданную модель, если есть, иначе создаём новую
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const postSchema = new mongoose.Schema({
  postId: { type: Number, unique: true },
  authorId: { type: Number, required: true },
  title: { type: String, required: true },
  theme: { type: String, default: '' },
  cover: { type: String, default: '' },
  content: { type: String, default: '' },
  date: { type: String, default: () => new Date().toLocaleDateString('ru-RU') },
  time: { type: String, default: () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) },
  createdAt: { type: Date, default: Date.now }
});

postSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'postId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.postId = counter.seq;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

module.exports = { Post, Counter };