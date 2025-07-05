document.addEventListener('DOMContentLoaded', () => {

    // ====== Controller about | Our team ======
    let currentIndex = 0;
    let blocks = document.querySelectorAll('.about-block');
    let dots = document.querySelectorAll('.dot');
    let interval;

    function showBlock(index) {
        blocks.forEach(block => block.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        blocks[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    }

    function nextBlock() {
        currentIndex = (currentIndex + 1) % blocks.length;
        showBlock(currentIndex);
    }

    function startAutoSlide() {
        interval = setInterval(nextBlock, 3000);
    }

    function resetAutoSlide() {
        clearInterval(interval);
        startAutoSlide();
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showBlock(index);
            resetAutoSlide();
        });
    });
    startAutoSlide();
});

// ====== Controller license + user agreement ======
document.querySelectorAll('.legal-toggle').forEach(button => {
    button.addEventListener('click', function () {
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