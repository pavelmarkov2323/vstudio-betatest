document.addEventListener("DOMContentLoaded", function () {
    
    const sequence = [
        {
            parent: '.brand-logoinfo-card',
            children: ['.brand-logoinfo-title', '.brand-logoinfo-divider', '.brand-logoinfo-description']
        },
        {
            parent: '.brand-productinfo-card',
            children: ['.brand-productinfo-title', '.brand-productinfo-divider', '.brand-productinfo-description']
        },
        {
            parent: '.brand-card-color',
            children: [
                '.brand-color-title', '.brand-color-divider',
                '.circle-one', '.values-one',
                '.circle-two', '.values-two',
                '.circle-three', '.values-three'
            ]
        },
        {
            parent: '.brand-partnerinfo-card',
            children: [
                '.media-partner-title', '.partner-media-description', '.plink-mediamail',
                '.partner-press-title', '.partner-press-description', '.link-pressmail',
                '.partner-materials-title', '.partner-materials-description', '.partner-material-link'
            ]
        },
        {
            parent: '.brand-info-card',
            children: ['.brand-info-icon', '.brand-info-text']
        }
    ];

    // Назначаем анимацию всем родителям и дочерним
    sequence.forEach(item => {
        const parentEl = document.querySelector(item.parent);
        if (parentEl) parentEl.classList.add('animated');
        item.children.forEach(child => {
            const el = document.querySelector(child);
            if (el) el.classList.add('animated');
        });
    });

    let currentStep = 0;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const step = sequence[currentStep];
                const parentEl = document.querySelector(step.parent);

                if (entry.target === parentEl) {
                    observer.unobserve(entry.target);
                    animateStep(step, () => {
                        currentStep++;
                        const next = sequence[currentStep];
                        if (next) {
                            const nextParent = document.querySelector(next.parent);
                            if (nextParent) observer.observe(nextParent);
                        }
                    });
                }
            }
        });
    }, {
        threshold: 0.3
    });

    // Наблюдаем только за первым блоком в начале
    const firstParent = document.querySelector(sequence[0].parent);
    if (firstParent) observer.observe(firstParent);

    function animateStep(step, callback) {
        const parentEl = document.querySelector(step.parent);
        if (parentEl) {
            parentEl.classList.add('visible');
        }

        let delay = 300;
        step.children.forEach((selector, index) => {
            const el = document.querySelector(selector);
            if (el) {
                setTimeout(() => {
                    el.classList.add('visible');
                }, delay * (index + 1));
            }
        });

        // Вызываем callback после последнего child
        const totalDelay = delay * (step.children.length + 1);
        setTimeout(() => {
            if (callback) callback();
        }, totalDelay);
    }
});