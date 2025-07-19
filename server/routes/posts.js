const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Post } = require('../models/post');
const { User } = require('../models/user'); // Подключаем модель

// Настройка storage для обложек постов (папка 'post')
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'post',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => {
      if (!req.session || !req.session.userId) {
        return `post_unknown_${Date.now()}`;
      }
      return `post_${req.session.userId}_${Date.now()}`;
    }
  }
});
const upload = multer({ storage: postStorage });

// Получение всех постов (максимум 20)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(20);
    // Для каждого поста добавим автора по userId (чтобы отдать имя и можно сделать canEdit)
    const authorIds = posts.map(p => p.authorId);
    const users = await User.find({ userId: { $in: authorIds } }).select('userId firstName lastName username');
    const usersMap = new Map(users.map(u => [u.userId, u]));

    const result = posts.map(post => {
      const author = usersMap.get(post.authorId);
      return {
        id: post.postId,
        title: post.title,
        theme: post.theme,
        cover: post.cover,
        date: post.date,
        time: post.time,
        author: author ? (author.firstName + ' ' + author.lastName) : 'Неизвестный',
        canEdit: req.session.userId === post.authorId
      };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение одного поста по id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.id });
    if (!post) return res.status(404).json({ message: 'Пост не найден' });

    const author = await User.findOne({ userId: post.authorId }).select('firstName lastName username');
    res.json({
      id: post.postId,
      title: post.title,
      theme: post.theme,
      cover: post.cover,
      date: post.date,
      time: post.time,
      author: author ? (author.firstName + ' ' + author.lastName) : 'Неизвестный',
      authorId: post.authorId,
      content: post.content,
      canEdit: req.session.userId === post.authorId
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание нового поста (требует авторизации)
router.post('/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Не авторизован' });

  const { title, theme, cover, content } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Не хватает данных' });

  try {
    const post = new Post({
      authorId: req.session.userId,
      title,
      theme,
      cover,
      content,
      date: new Date().toLocaleDateString('ru-RU'),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    });
    await post.save();
    res.status(201).json({ message: 'Пост создан', postId: post.postId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление поста (требует авторизации и владения постом)
router.put('/:id', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Не авторизован' });

  try {
    const post = await Post.findOne({ postId: req.params.id });
    if (!post) return res.status(404).json({ message: 'Пост не найден' });
    if (post.authorId !== req.session.userId) return res.status(403).json({ message: 'Нет доступа' });

    const { title, theme, cover, content } = req.body;
    post.title = title || post.title;
    post.theme = theme || post.theme;
    post.cover = cover || post.cover;
    post.content = content || post.content;

    await post.save();
    res.json({ message: 'Пост обновлен' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Загрузка обложки поста (отдельный роут для multer + cloudinary)
router.post('/upload-cover', upload.single('cover'), (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Не авторизован' });
  if (!req.file) return res.status(400).json({ message: 'Файл не загружен' });
  res.json({ url: req.file.path });
});

module.exports = router;