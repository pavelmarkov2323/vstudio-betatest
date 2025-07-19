const app = document.getElementById('app');

// Шаблон карточки поста (для списка постов)
function renderPostCard(post) {
  return `
    <a href="/blog/post/${post.id}" class="post-card">
      <div class="post-image" style="background-image: url('${post.cover}');"></div>
      <div class="post-info">
        <h3 class="post-title">${post.title}</h3>
        <p class="post-meta">Тема: ${post.theme} | ${post.date} в ${post.time}</p>
        <p class="post-author">Автор: ${post.author}</p>
      </div>
    </a>
  `;
}

// Рендер списка постов (вставляем несколько карточек, максимум 4 в ряд)
function renderBlog(posts) {
  const postsHtml = posts.map(renderPostCard).join('');
  app.innerHTML = `<main class="blog-container">${postsHtml}</main>`;
}

// Шаблон открытого поста
function renderOpenPost(post) {
  app.innerHTML = `
    <main class="post-container">
      <div class="post-header">
        <img src="${post.cover}" alt="Обложка поста" class="post-cover" />
        <div class="post-meta-info">
          <h1 class="post-title-full">${post.title}</h1>
          <p class="post-meta">Тема: ${post.theme} | ${post.date} в ${post.time}</p>
          <p class="post-author">Автор: ${post.author}</p>
          ${post.canEdit ? `<button id="editPostBtn" class="btn btn-edit">Редактировать</button>` : ''}
        </div>
      </div>
      <article class="post-content">${post.content}</article>
    </main>
  `;

  if (post.canEdit) {
    document.getElementById('editPostBtn').addEventListener('click', () => {
      renderEditPost(post);
    });
  }
}

// Шаблон редактора поста
function renderEditPost(post = {title:'', theme:'', cover:'', content:''}) {
  app.innerHTML = `
    <main class="editor-container">
      <h1 class="editor-title">${post.id ? 'Редактирование поста' : 'Создание поста'}</h1>
      <form class="editor-form" id="postForm">
        <div class="form-group">
          <label>Название поста:</label>
          <input type="text" name="title" class="editor-input input-narrow" placeholder="Введите заголовок" value="${post.title}" />
        </div>
        <div class="form-group">
          <label>Тема (категория):</label>
          <input type="text" name="theme" class="editor-input input-narrow" placeholder="Например: Новости" value="${post.theme}" />
        </div>
        <div class="form-group">
          <label>Обложка поста:</label>
          <div class="cover-upload">
            <input type="text" name="cover" class="editor-input" placeholder="https://example.com/image.jpg" value="${post.cover}" />
            <button type="button" class="btn btn-upload" id="btnUploadCover">Загрузить</button>
          </div>
          <input type="file" id="fileInputCover" accept="image/*" style="display:none" />
        </div>
        <div class="form-group">
          <label>Контент:</label>
          <div id="editor" class="wysiwyg-editor"></div>
        </div>
        <div class="editor-buttons">
          <button type="button" class="btn btn-secondary" id="saveDraftBtn">Сохранить в черновик</button>
          <button type="submit" class="btn btn-primary">Опубликовать</button>
        </div>
      </form>
    </main>
  `;

  // Инициализация Quill с содержимым
  const quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Введите содержимое поста...',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean']
      ]
    }
  });
  quill.root.innerHTML = post.content || '';

  // Логика загрузки обложки
  const btnUploadCover = document.getElementById('btnUploadCover');
  const fileInputCover = document.getElementById('fileInputCover');
  const coverInput = document.querySelector('input[name="cover"]');
  btnUploadCover.addEventListener('click', () => fileInputCover.click());
  fileInputCover.addEventListener('change', () => {
    const file = fileInputCover.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      coverInput.value = url;
    }
  });

  // Сохранить черновик
  document.getElementById('saveDraftBtn').addEventListener('click', () => {
    alert('Черновик сохранён!\n\n' + quill.root.innerHTML);
  });

  // Отправка формы
  document.getElementById('postForm').addEventListener('submit', e => {
    e.preventDefault();
    const postData = {
      title: e.target.title.value,
      theme: e.target.theme.value,
      cover: e.target.cover.value,
      content: quill.root.innerHTML
    };
    alert('Пост отправлен!\n\n' + JSON.stringify(postData, null, 2));
    // Здесь можно отправить postData на сервер
  });
}