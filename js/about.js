document.addEventListener('DOMContentLoaded', () => {

    // Убедимся, что всё скрыто при старте
    document.querySelectorAll('.legal-content').forEach(content => {
        content.style.display = 'none';
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
        parent.classList.toggle('open');

        const content = parent.querySelector('.legal-content');
        if (parent.classList.contains('open')) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
});