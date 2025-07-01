document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // если нужно только один раз
            }
        });
    }, {
        threshold: 0.2
    });

    // Выбираем все нужные блоки сразу
    const targets = document.querySelectorAll('.brand-partnerinfo-card, .brand-card-color, .brand-logoinfo-card, .brand-productinfo-card, .brand-info-card');

    targets.forEach(target => {
        observer.observe(target);
    });
});
