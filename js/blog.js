document.addEventListener("DOMContentLoaded", async () => {
    const addCard = document.getElementById("add-blog");
    const modal = document.getElementById("modal-blog-edit");
    const closeBtn = document.getElementById("close-modal");
    const publishBtn = document.querySelector('.publish-btn');
    const container = document.querySelector('.posts-container');

    // Проверка авторизации
    try {
        const res = await fetch("/api/current-user");
        const data = await res.json();

        if (data.status === 5) {
            addCard.style.display = "flex";

            const openBtn = document.getElementById("add-blog-post");
            if (openBtn) {
                openBtn.addEventListener("click", () => {
                    modal.style.display = "flex";
                });
            }
        }
    } catch (err) {
        console.error("Ошибка проверки статуса:", err);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // ==== Новый код: определение текущей страницы ====
    const pathParts = window.location.pathname.split('/');
    const isPostPage = pathParts.length === 3 && pathParts[1] === 'blog';
    const slug = pathParts[2];

    if (isPostPage) {
        loadSinglePost(slug);
    } else {
        loadPosts();
    }

    // ==== Загрузка всех постов ====
    async function loadPosts() {
        try {
            const res = await fetch('/api/posts');
            const posts = await res.json();

            container.innerHTML = ''; // Очищаем перед вставкой

            posts.forEach(post => {
                const postHTML = `
                    <a href="/blog/${post.slug}" class="post-card-link">
                        <div class="post-card theme-blog-cards">
                            <img src="${post.imageUrl}" alt="Post Image" class="post-image" />
                            <div class="post-info theme-blog-cards">
                                <h3 class="post-title theme-text">${post.title}</h3>
                                <p class="post-description">${post.previewDescription}</p>
                                <div class="post-meta">
                                    <span class="post-author">${post.username}</span>
                                    <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                `;
                container.insertAdjacentHTML('beforeend', postHTML);
            });
        } catch (err) {
            console.error("Ошибка загрузки постов:", err);
            container.innerHTML = '<p>Ошибка загрузки постов</p>';
        }
    }

    // ==== Загрузка одного поста ====
    async function loadSinglePost(slug) {
        try {
            const res = await fetch(`/api/posts/${slug}`);
            if (!res.ok) throw new Error('Пост не найден');

            const post = await res.json();

            container.innerHTML = `
                <div class="single-post">
                    <h1 class="theme-text">${post.title}</h1>
                    <p class="post-meta">${post.username}, ${new Date(post.createdAt).toLocaleDateString()}</p>
                    <img src="${post.imageUrl}" alt="Post Image" class="post-image-large">
                    <div class="post-content">${post.content}</div>
                    <a href="/blog" class="back-to-blog theme-text">← Назад ко всем постам</a>
                </div>
            `;
        } catch (err) {
            console.error("Ошибка загрузки поста:", err);
            container.innerHTML = '<p>Пост не найден</p>';
        }
    }

    // ==== Инициализация редактора ====
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Напишите ваш текст...',
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // ==== Загрузка превью изображения ====
    document.getElementById('upload-preview-btn').addEventListener('click', async () => {
        const fileInput = document.getElementById('preview-file-input');
        const file = fileInput.files[0];
        if (!file) {
            alert('Пожалуйста, выберите файл для загрузки.');
            return;
        }

        const formData = new FormData();
        formData.append('preview', file);

        try {
            const res = await fetch('/api/posts/upload-preview', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                document.getElementById('preview-image-url').value = data.imageUrl;
                alert('Изображение успешно загружено!');
            } else {
                alert(data.message || 'Ошибка загрузки изображения');
            }
        } catch (e) {
            console.error('Ошибка загрузки:', e);
            alert('Ошибка при загрузке изображения');
        }
    });

    // ==== Создание поста ====
    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            const titleInput = document.querySelector('input[placeholder="Введите заголовок"]');
            const previewInput = document.querySelector('textarea[placeholder="Краткое описание"]');
            const imageInput = document.querySelector('input[placeholder="URL или файл изображения"]');
            const dateInput = document.querySelector('input[type="date"]');
            const timeInput = document.querySelector('input[type="time"]');

            const title = titleInput?.value?.trim();
            const previewDescription = previewInput?.value?.trim();
            const imageUrl = document.getElementById('preview-image-url').value.trim();
            const content = quill.root.innerHTML;
            const date = dateInput?.value;
            const time = timeInput?.value;

            if (!title || !previewDescription || !imageUrl || !content) {
                alert("Пожалуйста, заполните все поля.");
                return;
            }

            const publishedAt = date && time ? new Date(`${date}T${time}`) : new Date();

            try {
                const res = await fetch('/api/posts/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        previewDescription,
                        imageUrl,
                        content,
                        publishedAt,
                        isDraft: false
                    })
                });

                const result = await res.json();

                if (res.ok) {
                    alert("Пост успешно создан!");
                    modal.style.display = "none";
                    window.location.href = `/blog/${result.post.slug}`; // Перейти на созданный пост
                } else {
                    alert(result.message || "Ошибка при создании поста.");
                }
            } catch (err) {
                console.error("Ошибка при отправке поста:", err);
                alert("Серверная ошибка.");
            }
        });
    }
});