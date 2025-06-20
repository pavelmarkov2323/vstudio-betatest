document.addEventListener('DOMContentLoaded', function () {

    let lastScrollTop = 0;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function () {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > lastScrollTop) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });


    // Кнопка входа
    const signInBtn = document.querySelector('.signin-btn');
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            window.location.href = 'auth.html';
        });
    }

    // Выпадающее меню пользователя
    const avatarToggle = document.getElementById('avatarToggle');
    const dropdown = document.getElementById('userDropdown');
    const dropdownIcon = avatarToggle.querySelector('.dropdown-icon');

    if (avatarToggle && dropdown) {
        avatarToggle.addEventListener('click', () => {
            const isOpen = dropdown.classList.contains('show');
            dropdown.classList.toggle('show', !isOpen);
            dropdownIcon.classList.toggle('rotate', !isOpen);
        });

        document.addEventListener('click', function (e) {
            if (!avatarToggle.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                dropdownIcon.classList.remove('rotate');
            }
        });
    }

    // Логика показа кнопок на всех страницах
    fetch('/api/current-user')
    .then(res => {
        if (!res.ok) throw new Error('Не авторизован');
        return res.json();
    })
    .then(user => {
        // Показываем меню для залогиненного
        if (signinBtn) signinBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';

        const goToProfile = document.getElementById('menuProfile');
        if (goToProfile) {
        goToProfile.addEventListener('click', () => {
            window.location.href = `/profile/${user.username}`;
        });
        }

        const logoutBtn = document.getElementById('menuLogout');
        if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/index.html';
        });
        }
    })
    .catch(() => {
        // Пользователь не залогинен
        if (signinBtn) signinBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    });
});