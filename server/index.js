require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Отдаём статику из корня проекта, чтобы клиентские файлы были доступны
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Можно добавить обработку других маршрутов, если нужно
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'home.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});