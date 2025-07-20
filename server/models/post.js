  const mongoose = require('mongoose');

  const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    previewDescription: { type: String, required: true },
    imageUrl: { type: String, required: true }, // cloudinary
    content: { type: String, required: true }, // HTML от Quill
    authorId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    publishedAt: { type: Date },
    isDraft: { type: Boolean, default: false }
  });

  module.exports = mongoose.model('Post', postSchema);
