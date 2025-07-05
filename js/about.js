document.addEventListener('DOMContentLoaded', () => {

    // Устанавливаем начальные стили (высота 0)
    document.querySelectorAll('.legal-content').forEach(content => {
        content.style.height = '0px';
        content.style.opacity = '0';
    });

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
        const parent = this.closest('.legal-item');
        const content = parent.querySelector('.legal-content');
        const isOpen = parent.classList.contains('open');

        if (isOpen) {
            // Закрытие
            const contentHeight = content.scrollHeight;
            content.style.height = contentHeight + 'px'; // зафиксируем высоту
            content.offsetHeight; // принудительный reflow
            content.style.height = '0px';
            content.style.opacity = '0';
            content.style.marginTop = '0';
            parent.classList.remove('open');
        } else {
            // Открытие
            const contentHeight = content.scrollHeight;
            content.style.height = contentHeight + 'px';
            content.style.opacity = '1';
            content.style.marginTop = '10px';
            parent.classList.add('open');
        }
    });
});