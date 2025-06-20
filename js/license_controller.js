document.querySelectorAll('.legal-toggle').forEach(button => {
    button.addEventListener('click', function() {
        const content = this.nextElementSibling; // Содержимое
        const arrow = this.querySelector('.arrow'); // Стрелка
        const parent = this.closest('.legal-item'); // Родительский элемент

        // Переключаем видимость контента
        if (content.style.display === 'block') {
            content.style.display = 'none';
            parent.classList.remove('open'); // Убираем класс "open" для возврата стрелки
        } else {
            content.style.display = 'block';
            parent.classList.add('open'); // Добавляем класс "open" для поворота стрелки
        }
    });
});