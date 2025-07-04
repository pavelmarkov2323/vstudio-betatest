const themeToggles = document.querySelectorAll('.theme-toggle input');
const body = document.body;

// Проверяем текущую тему при загрузке страницы
const isDark = localStorage.getItem('theme') === 'dark';
if (isDark) {
    body.classList.add('dark-theme');
} else {
    body.classList.remove('dark-theme');
}

// Устанавливаем состояние всех переключателей
themeToggles.forEach(toggle => {
    toggle.checked = isDark;

    toggle.addEventListener('change', function () {
        const newTheme = this.checked ? 'dark' : 'light';
        body.classList.toggle('dark-theme', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);

        // Обновляем все переключатели
        themeToggles.forEach(t => {
            if (t !== this) t.checked = this.checked;
        });
        // Мобильный переключатель
        updateMobileIcon(newTheme);
    });
});

const mobileThemeBtn = document.getElementById('mobileThemeBtn');
const mobileThemeIcon = document.getElementById('mobileThemeIcon');

// Функция для установки иконки в зависимости от темы
function updateMobileIcon(theme) {
    if (mobileThemeIcon) {
        // Если текущая тема темная — показываем солнце, чтобы предложить светлую
        mobileThemeIcon.src = theme === 'dark' ? '/assets/icons/sun.svg' : '/assets/icons/moon-stars.svg';
    }
}

// При загрузке — установить иконку
updateMobileIcon(isDark ? 'dark' : 'light');

// При клике на иконку
if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
        body.classList.toggle('dark-theme', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);

        // Обновить иконку
        updateMobileIcon(newTheme);

        // Синхронизировать с чекбоксами
        themeToggles.forEach(t => {
            t.checked = newTheme === 'dark';
        });
    });
}
