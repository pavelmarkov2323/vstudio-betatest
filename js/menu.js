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

    const signinBtn = document.querySelector('.signin-btn');
    const userMenu = document.querySelector('.user-menu');

    fetch('/api/current-user', { credentials: 'include' })
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

            const goToSettings = document.getElementById('menuSettings');
            if (goToSettings) {
                goToSettings.addEventListener('click', () => {
                    window.location.href = `/settings.html`;
                });
            }

            const logoutBtn = document.getElementById('menuLogout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    await fetch('/api/logout', { method: 'POST' });
                    window.location.href = '/index.html';
                });
            }

            // Отображаем и обновляем баланс пользователя
            const balanceElem = document.getElementById('balanceAmount');
            if (balanceElem && typeof user.balance === 'number') {
                const formatter = new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                });
                balanceElem.textContent = formatter.format(user.balance);
            }
        })
        .catch(() => {
            // Пользователь не залогинен
            if (signinBtn) signinBtn.style.display = 'inline-block';
            if (userMenu) userMenu.style.display = 'none';
        });

    const burger = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('closeMenu');

    // Анимационные элементы
    const themeToggle = document.querySelector('.mobile-theme-toggle');
    const closeButton = document.querySelector('.mobile-menu_close');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLogo = document.querySelector('.mobile-logo');


    if (burger && closeBtn && mobileMenu && themeToggle && closeButton && mobileNav) {
        burger.addEventListener('click', () => {
            mobileMenu.classList.add('show');

            // Явно сбрасываем стили, чтобы анимация срабатывала при каждом открытии
            requestAnimationFrame(() => {
                themeToggle.style.transition = '';
                closeButton.style.transition = '';
                mobileNav.style.transition = '';
                mobileLogo.style.transition = '';

                themeToggle.style.opacity = '1';
                themeToggle.style.visibility = 'visible';

                closeButton.style.opacity = '1';
                closeButton.style.visibility = 'visible';

                mobileNav.style.opacity = '1';
                mobileNav.style.visibility = 'visible';

                // Задержка появления логотипа
                setTimeout(() => {
                    mobileLogo.style.opacity = '1';
                    mobileLogo.style.transform = 'translateX(-50%) translateY(0)';
                }, 700); // появится через 0.5 сек
            });
        });

        closeBtn.addEventListener('click', () => {
            // Убираем видимость вложенных элементов
            themeToggle.style.opacity = '0';
            themeToggle.style.visibility = 'hidden';
            themeToggle.style.transition = 'opacity 0.3s ease, visibility 0s linear 0.3s';

            closeButton.style.opacity = '0';
            closeButton.style.visibility = 'hidden';
            closeButton.style.transition = 'opacity 0.3s ease, visibility 0s linear 0.3s';

            mobileNav.style.opacity = '0';
            mobileNav.style.visibility = 'hidden';
            mobileNav.style.transition = 'opacity 0.3s ease, visibility 0s linear 0.3s';

            mobileLogo.style.opacity = '0';
            mobileLogo.style.transform = 'translateX(-50%) translateY(80px)';
            mobileLogo.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

            // Добавляем "анимацию скрытия"
            mobileMenu.classList.add('hiding');

            setTimeout(() => {
                mobileMenu.classList.remove('show', 'hiding');
            }, 400); // Время анимации меню
        });
    }
});