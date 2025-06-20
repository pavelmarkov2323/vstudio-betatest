// themeswitch.js
const themeToggle = document.querySelector('.theme-toggle input');
const body = document.body;

// Проверяем текущую тему при загрузке страницы
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-theme');
    themeToggle.checked = true;
} else {
    body.classList.remove('dark-theme');
    themeToggle.checked = false;
}

// Обработчик переключения темы
themeToggle.addEventListener('change', function() {
    if (this.checked) {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark'); // Сохраняем тему в localStorage
    } else {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light'); // Сохраняем тему в localStorage
    }
});
