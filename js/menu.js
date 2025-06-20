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
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    const signinBtn = document.querySelector('.signin-btn');
    const userMenu = document.querySelector('.user-menu');

    if (loggedUser) {
        // Пользователь залогинен — показываем меню, скрываем кнопку входа
        if (signinBtn) signinBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';

        // Обработчик клика по "My Profile"
        const goToProfile = document.getElementById('menuProfile');
        if (goToProfile) {
            goToProfile.addEventListener('click', () => {
                window.location.href = `/profile/${loggedUser.username}`;
            });
        }

        // Обработчик клика по "Logout"
        const logoutBtn = document.getElementById('menuLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('loggedUser'); // Удаляем данные из localStorage
                window.location.href = '/index.html';  // Редирект на главную
            });
        }
    } else {
        // Пользователь не залогинен — показываем кнопку входа, скрываем меню
        if (signinBtn) signinBtn.style.display = 'inline-block'; // или 'block'
        if (userMenu) userMenu.style.display = 'none';
    }
});