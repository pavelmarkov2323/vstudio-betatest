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

            const resUser = await fetch("/api/current-user");
            const dataUser = await resUser.json();
            const isAdmin = dataUser.status === 5;

            const res = await fetch('/api/posts');
            const posts = await res.json();

            posts.forEach(post => {
                const postHTML = `
                <div class="post-card theme-blog-cards" style="position: relative;">
                    ${isAdmin ? `
                    <div class="post-dropdown-container">
                        <img src="/assets/icons/menu-dots.svg" alt="Меню" class="post-menu-icon"/>
                        <div class="postdropdown-menu" style="display: none;">
                            <div class="post-dropdown-item" id="copyLink">
                                <img src="/assets/icons/copy.svg"/>
                                <span>Копировать ссылку</span>
                            </div>
                            <div class="post-dropdown-item" id="deletePost">
                                <img src="/assets/icons/trash.svg"/>
                                <span>Удалить пост</span>
                            </div>
                        </div>
                    </div>` : ''}

                    <a href="/blog/${post.slug}" class="post-card-link" style="text-decoration: none; color: inherit;">
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
                </div>
                `;
                container.insertAdjacentHTML('beforeend', postHTML);
            });

            if (isAdmin) {
                // Навесим обработчики для меню
                container.querySelectorAll('.post-menu-icon').forEach(icon => {
                    icon.addEventListener('click', e => {
                        e.stopPropagation();
                        e.preventDefault(); // чтобы не срабатывало открытие поста
                        closeAllDropdowns();
                        const menu = icon.nextElementSibling;
                        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
                    });
                });

                // Закрытие всех меню при клике вне
                document.addEventListener('click', () => {
                    closeAllDropdowns();
                });

                function closeAllDropdowns() {
                    container.querySelectorAll('.postdropdown-menu').forEach(menu => {
                        menu.style.display = 'none';
                    });
                }

                // Наведение для затемнения элементов
                container.querySelectorAll('.post-dropdown-item').forEach(item => {
                    item.addEventListener('mouseenter', () => {
                        item.style.backgroundColor = '#F5F6F7';
                        item.style.borderRadius = '6px';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.backgroundColor = 'transparent';
                    });
                });

                // Обработчики нажатия на пункты меню
                container.querySelectorAll('.post-dropdown-item').forEach(item => {
                    item.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const postCard = item.closest('.post-card');
                        const postLink = postCard.querySelector('a')?.href || postCard.querySelector('a')?.getAttribute('href');
                        const slug = postLink ? postLink.split('/blog/')[1] : null;

                        if (!slug) return;

                        if (item.id === 'copyLink') {
                            const url = window.location.origin + '/blog/' + slug;
                            try {
                                await navigator.clipboard.writeText(url);
                                alert('Ссылка скопирована!');
                            } catch {
                                alert('Не удалось скопировать ссылку');
                            }
                        }

                        if (item.id === 'deletePost') {
                            if (confirm('Удалить этот пост?')) {
                                try {
                                    const res = await fetch(`/api/posts/delete/${slug}`, {
                                        method: 'DELETE'
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        alert('Пост удалён');
                                        postCard.remove();
                                    } else {
                                        alert(data.message || 'Ошибка при удалении');
                                    }
                                } catch (err) {
                                    alert('Ошибка сети');
                                }
                            }
                        }

                        // Скрываем меню после действия
                        closeAllDropdowns();
                    });
                });
            }

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

    class ImageUploader {
        constructor(quill, options) {
            this.quill = quill;
            this.options = options;

            const toolbar = quill.getModule('toolbar');
            toolbar.addHandler('image', this.selectLocalImage.bind(this));
        }

        selectLocalImage() {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
                const file = input.files[0];
                if (!file) return;

                // Ограничение на 2MB
                if (file.size > 2 * 1024 * 1024) {
                    alert('Размер изображения не должен превышать 2MB.');
                    return;
                }

                const formData = new FormData();
                formData.append('image', file);

                try {
                    const res = await fetch('/api/posts/upload-image', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await res.json();

                    if (res.ok) {
                        const range = this.quill.getSelection();
                        this.quill.insertEmbed(range.index, 'image', data.imageUrl);
                    } else {
                        alert(data.message || 'Ошибка загрузки изображения');
                    }
                } catch (err) {
                    console.error('Ошибка загрузки изображения:', err);
                    alert('Ошибка загрузки');
                }
            };
        }
    }

    Quill.register('modules/imageUploader', ImageUploader);

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
            ],
            imageUploader: {} // подключили наш кастомный модуль

        }
    });

    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            const titleInput = document.querySelector('input[placeholder="Введите заголовок"]');
            const previewInput = document.getElementById('preview-description');
            const fileInput = document.getElementById('preview-file-input');
            const dateInput = document.querySelector('input[type="date"]');
            const timeInput = document.querySelector('input[type="time"]');

            const title = titleInput?.value?.trim();
            const previewDescription = previewInput?.value?.trim();
            const file = fileInput.files[0];
            const content = quill.root.innerHTML.trim();
            const plainText = quill.getText().trim(); // Получаем текст без HTML-тегов
            const date = dateInput?.value;
            const time = timeInput?.value;

            if (!title) {
                alert("Пожалуйста, введите заголовок.");
                return;
            }

            if (title.length > 100) {
                alert("Заголовок не должен превышать 100 символов.");
                return;
            }

            if (!previewDescription) {
                alert("Пожалуйста, введите превью описание.");
                return;
            }

            if (previewDescription.length > 300) {
                alert("Превью описание не должно превышать 300 символов.");
                return;
            }

            if (!file) {
                alert("Выберите изображение для превью.");
                return;
            }

            if (file.size > 4 * 1024 * 1024) {
                alert("Размер изображения не должен превышать 4MB.");
                return;
            }

            if (plainText === "") {
                alert("Основной контент не должен быть пустым.");
                return;
            }

            const publishedAt = date && time ? new Date(`${date}T${time}`) : new Date();

            // Сначала загружаем изображение
            const formData = new FormData();
            formData.append('preview', file);

            let imageUrl = "";
            let imagePublicId = "";

            try {
                const uploadRes = await fetch('/api/posts/upload-preview', {
                    method: 'POST',
                    body: formData
                });

                const uploadData = await uploadRes.json();

                if (!uploadRes.ok) throw new Error(uploadData.message || 'Ошибка загрузки');

                imageUrl = uploadData.imageUrl;
                imagePublicId = uploadData.publicId;
            } catch (err) {
                console.error("Ошибка при загрузке превью:", err);
                alert("Ошибка при загрузке превью");
                return;
            }

            // Теперь создаём пост
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
                        imagePublicId,
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

    // Установка текущей даты и времени по умолчанию
    const dateInput = document.querySelector('input[type="date"]');
    const timeInput = document.querySelector('input[type="time"]');

    if (dateInput && timeInput) {
        const now = new Date();

        // Устанавливаем дату в формате YYYY-MM-DD
        dateInput.value = now.toISOString().split('T')[0];

        // Устанавливаем время в формате HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
});