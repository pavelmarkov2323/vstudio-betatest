document.addEventListener("DOMContentLoaded", async () => {

    const addCard = document.getElementById("add-blog");

    try {
        const res = await fetch("/api/current-user");
        const data = await res.json();

        if (data.status === 5) {
            addCard.style.display = "flex";
        }
    } catch (err) {
        console.error("Ошибка проверки статуса:", err);
    }

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

    document.addEventListener("DOMContentLoaded", loadPosts);


    const modal = document.getElementById("modal-blog-edit");
    const openBtn = document.getElementById("add-blog-post");
    const closeBtn = document.getElementById("close-modal");

    // Открытие модального окна
    openBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    // Закрытие по кнопке
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Закрытие по фону
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

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
});