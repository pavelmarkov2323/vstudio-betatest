document.addEventListener("DOMContentLoaded", async () => {
    const addCard = document.getElementById("add-blog");
    const modal = document.getElementById("modal-blog-edit");
    const closeBtn = document.getElementById("close-modal");
    const publishBtn = document.querySelector('.publish-btn');


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

    // Закрытие по кнопке
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // Закрытие по фону
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    async function loadPosts() {
        const container = document.querySelector('.posts-container');
        try {
            const res = await fetch('/api/posts');
            const posts = await res.json();

            posts.forEach(post => {
                const postHTML = `
                <a href="/blog/${post.slug}" class="post-card theme-blog-cards" style="text-decoration: none; color: inherit;">
                    <img src="${post.imageUrl}" alt="Post Image" class="post-image" />
                    <div class="post-info theme-blog-cards">
                        <h3 class="post-title theme-text">${post.title}</h3>
                        <p class="post-description">${post.previewDescription}</p>
                        <div class="post-meta">
                            <span class="post-author">${post.username}</span>
                            <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </a>
            `;
                container.insertAdjacentHTML('beforeend', postHTML);
            });
        } catch (err) {
            console.error("Ошибка загрузки постов:", err);
        }
    }

    loadPosts();

    const slugMatch = window.location.pathname.match(/^\/blog\/(.+)/);
    if (slugMatch) {
        const slug = slugMatch[1];

        // Скрываем заголовок блога
        const blogHeader = document.querySelector('.blog-header');
        if (blogHeader) blogHeader.style.display = 'none';

        // Скрываем контейнер с превью
        const previewContainer = document.querySelector('.posts-container');
        previewContainer.style.display = 'none';

        // Показываем full-post-container
        const fullContainer = document.querySelector('.full-post-container');
        fullContainer.style.display = 'block';

        try {
            const res = await fetch(`/api/posts/${slug}`);
            const post = await res.json();

            if (res.ok) {
                const fullHTML = `
                <div class="post-full theme-blog-post">
                    <h1 class="theme-text">${post.title}</h1>
                    <div class="post-full-meta">
                        <span class="post-author theme-text">${post.username}</span> |
                        <span class="post-date theme-text">${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <img src="${post.imageUrl}" alt="Post Image" class="post-full-image" />
                    <div class="post-full-content theme-text">${post.content}</div>
                </div>
            `;
                fullContainer.innerHTML = fullHTML;
            } else {
                fullContainer.innerHTML = '<p class="theme-text">Пост не найден.</p>';
            }
        } catch (err) {
            console.error('Ошибка загрузки поста:', err);
            fullContainer.innerHTML = '<p class="theme-text">Ошибка при загрузке поста.</p>';
        }

        return; // остановить выполнение дальше
    }

    // Инициализация Quill
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Начните творить прямо сейчас, создайте крутую публикацию!',
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

    document.getElementById('upload-preview-btn').addEventListener('click', async () => {
        const fileInput = document.getElementById('preview-file-input');
        const file = fileInput.files[0];
        if (!file) {
            alert('Пожалуйста, выберите файл для загрузки.');
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            alert('Размер изображения не должен превышать 4MB.');
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
            const content = quill.root.innerHTML.trim();
            const plainText = quill.getText().trim(); // Получаем текст без HTML-тегов
            const date = dateInput?.value;
            const time = timeInput?.value;

            if (!title || !previewDescription || !imageUrl || plainText === "") {
                alert("Пожалуйста, заполните все поля, включая основной текст.");
                return;
            }

            if (title.length > 100) {
                alert("Заголовок не должен превышать 100 символов.");
                return;
            }

            if (previewDescription.length > 300) {
                alert("Превью описание не должно превышать 300 символов.");
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
                    window.location.reload(); // Перезагрузи посты
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