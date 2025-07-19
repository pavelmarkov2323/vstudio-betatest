document.addEventListener("DOMContentLoaded", async () => {
    const addCard = document.getElementById("add-blog");
    const modal = document.getElementById("modal-blog-edit");
    const closeBtn = document.getElementById("close-modal");
    const publishBtn = document.querySelector('.publish-btn');
    const fileInput = document.getElementById('preview-file');
    const uploadBtn = document.getElementById('upload-btn');
    const imageUrlInput = document.querySelector('input[placeholder="URL или файл изображения"]');

    // Скрываем текстовое поле с URL, чтобы пользователь не вставлял ссылку (если хочешь запретить вообще)
    if (imageUrlInput) {
        imageUrlInput.style.display = 'none';
    }

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
                `;
                container.insertAdjacentHTML('beforeend', postHTML);
            });
        } catch (err) {
            console.error("Ошибка загрузки постов:", err);
        }
    }

    loadPosts();

    // Инициализация Quill
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

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', async () => {
            const file = fileInput.files[0];
            if (!file) {
                alert('Пожалуйста, выберите файл изображения.');
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
                    // Сохраняем url картинки в скрытое поле (или где у тебя в форме хранится imageUrl)
                    imageUrlInput.value = data.imageUrl;
                    alert('Изображение успешно загружено!');
                    // Добавим миниатюру
                    let previewImg = document.querySelector('.upload-section img.preview-thumb');
                    if (!previewImg) {
                        previewImg = document.createElement('img');
                        previewImg.classList.add('preview-thumb');
                        previewImg.style.maxWidth = '150px';
                        previewImg.style.marginTop = '10px';
                        uploadBtn.parentNode.appendChild(previewImg);
                    }
                    previewImg.src = data.imageUrl;
                } else {
                    alert(data.message || 'Ошибка при загрузке изображения.');
                }
            } catch (err) {
                console.error('Ошибка загрузки изображения:', err);
                alert('Ошибка загрузки изображения.');
            }
        });
    }

    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            const titleInput = document.querySelector('input[placeholder="Введите заголовок"]');
            const previewInput = document.querySelector('textarea[placeholder="Краткое описание"]');
            const imageInput = document.querySelector('input[placeholder="URL или файл изображения"]');
            const dateInput = document.querySelector('input[type="date"]');
            const timeInput = document.querySelector('input[type="time"]');

            const title = titleInput?.value?.trim();
            const previewDescription = previewInput?.value?.trim();
            const imageUrl = imageInput?.value?.trim();
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
