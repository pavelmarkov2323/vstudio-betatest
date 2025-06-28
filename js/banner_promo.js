document.addEventListener("DOMContentLoaded", function () {    
    document.querySelector('.close-banner-btn').addEventListener('click', () => {
        const banner = document.querySelector('.banner-promo');
        banner.classList.add('hidden');
        setTimeout(() => banner.style.display = 'none', 300);
    });
});