document.addEventListener('DOMContentLoaded', function () {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const arrow = item.querySelector('.faq-arrow');
        const dot = item.querySelector('.faq-dot');
        const questionId = item.getAttribute('data-question');

        // Проверяем сохранённый статус в localStorage
        if (localStorage.getItem(questionId) === 'open') {
            item.classList.add('active');
        }

        question.addEventListener('click', () => {
            // Закрыть все вопросы
            faqItems.forEach(faq => {
                if (faq !== item) {
                    faq.classList.remove('active');
                    localStorage.setItem(faq.getAttribute('data-question'), 'closed');
                }
            });

            // Переключить активное состояние для текущего вопроса
            const isActive = item.classList.toggle('active');

            // Сохраняем состояние в localStorage
            if (isActive) {
                localStorage.setItem(questionId, 'open');
            } else {
                localStorage.setItem(questionId, 'closed');
            }

            // Стрелка поворачивается
            if (item.classList.contains('active')) {
                arrow.style.transform = 'rotate(180deg)';
            } else {
                arrow.style.transform = 'rotate(0deg)';
            }
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    // Добавляем и FAQ
    const blocks = document.querySelectorAll('.roadmap-container, .faq-container');
    blocks.forEach(block => observer.observe(block));
});