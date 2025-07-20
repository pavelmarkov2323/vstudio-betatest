const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../cloudinary');
const { User } = require('../models/user');
const Post = require('../models/post');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cоздание slug ссылки поста
const { slugify } = require('transliteration');

const generateSlug = (title) => {
  return slugify(title, { lowercase: true });
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `preview_${Date.now()}`
  }
});

const upload = multer({ storage });

// Загрузка изображения из редактора (не превью!)
router.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Не авторизован' });

  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }

  res.json({ imageUrl: req.file.path });
});

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

    const slug = generateSlug(title);

    // проверка на дубликат
    const existing = await Post.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Пост с таким заголовком уже существует' });
    }

    const post = new Post({
      title,
      slug,
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
    const now = new Date();
    const posts = await Post.find({
      publishedAt: { $lte: now },
      isDraft: false
    }).sort({ publishedAt: -1 });

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

// Получение поста по slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug });

    if (!post) return res.status(404).json({ message: 'Пост не найден' });

    const user = await User.findOne({ userId: post.authorId });

    res.json({
      ...post._doc,
      username: user?.username || 'unknown'
    });
  } catch (err) {
    console.error('Ошибка получения поста по slug:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;