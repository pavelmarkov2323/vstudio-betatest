// themeswitch.js
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
    });
});
