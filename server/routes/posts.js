const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../cloudinary');
const { User } = require('../models/user');
const Post = require('../models/post');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `preview_${Date.now()}`
  }
});

const upload = multer({ storage });

// Загрузка превью изображения
router.post('/upload-preview', upload.single('preview'), async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Не авторизован' });
  if (!req.file || !req.file.path) return res.status(400).json({ message: 'Файл не загружен' });

  res.json({ imageUrl: req.file.path });
});

// Создание поста
router.post('/create', async (req, res) => {
  const { title, previewDescription, imageUrl, content, publishedAt, isDraft } = req.body;
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ message: 'Не авторизован' });

  if (!title || !previewDescription || !imageUrl || !content) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    const post = new Post({
      title,
      previewDescription,
      imageUrl,
      content,
      authorId: userId,
      publishedAt: isDraft ? null : publishedAt,
      isDraft
    });

    await post.save();
    res.json({ message: 'Пост создан', post });
  } catch (err) {
    console.error('Ошибка создания поста:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение всех постов
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });

    // Получение авторов
    const users = await User.find({ userId: { $in: posts.map(p => p.authorId) } });

    const enriched = posts.map(post => {
      const author = users.find(u => u.userId === post.authorId);
      return {
        ...post._doc,
        username: author?.username || 'unknown'
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Ошибка получения постов:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
