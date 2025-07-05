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