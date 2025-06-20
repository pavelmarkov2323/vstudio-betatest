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

// === Скрипт для кнопки Sign In и выпадающего меню пользователя ===
document.addEventListener('DOMContentLoaded', function () {
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
});