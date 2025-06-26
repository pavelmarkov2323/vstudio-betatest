document.addEventListener("DOMContentLoaded", function () {    
    document.querySelector('.close-banner-btn').addEventListener('click', () => {
        const banner = document.querySelector('.advertisement-banner');
        banner.classList.add('hidden');
        setTimeout(() => banner.style.display = 'none', 300);
    });
});