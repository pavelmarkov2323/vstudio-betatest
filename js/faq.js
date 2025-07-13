document.addEventListener('DOMContentLoaded', () => {

    function fadeInSequence(elements, delay = 300, callback) {
        elements.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('visible');
                if (i === elements.length - 1 && callback) {
                    callback();
                }
            }, delay * i);
        });
    }

    const tabOrder = ['main', 'subscription', 'account', 'security', 'other'];

    const tabContentMap = {
        main: ['main-item-one', 'main-item-two', 'main-item-three'],
        subscription: ['sub-item-one'],
        account: ['account-item-one'],
        security: ['security-item-one', 'security-item-two', 'security-item-three'],
        other: ['other-item-one'],
    };

    const faqTitle = document.querySelector('.faq-title');
    const faqSubtitle = document.querySelector('.faq-subtitle');
    const tabButtons = tabOrder.map(tab => document.querySelector(`.tab-button[data-tab="${tab}"]`));

    faqTitle.classList.add('fade-in-up');
    faqSubtitle.classList.add('fade-in-up');
    tabButtons.forEach(btn => btn.classList.add('fade-in-up'));
    Object.values(tabContentMap).flat().forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('fade-in-up');
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 1. Появляем faq-title (2 сек)
                fadeInSequence([faqTitle], 2000, () => {
                    // 2. Появляем faq-subtitle (2 сек)
                    fadeInSequence([faqSubtitle], 2000, () => {
                        // 3. Появляем кнопки поочередно (500 мс)
                        fadeInSequence(tabButtons, 500, () => {
                            // 4. Показываем контент активного таба после появления всех кнопок
                            const activeBtn = document.querySelector('.tab-button.active');
                            const activeTab = activeBtn ? activeBtn.dataset.tab : 'main';
                            showTabContent(activeTab);
                        });
                    });
                });
                obs.disconnect();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(faqTitle);

    function showTabContent(tabName) {
        // Скрываем контент всех табов и убираем класс visible у элементов
        tabOrder.forEach(tab => {
            const tabContent = document.getElementById(tab);
            if (tabContent) {
                tabContent.classList.add('hidden');
                tabContentMap[tab].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.remove('visible');
                });
            }
        });

        // Показываем контент активного таба
        const activeContent = document.getElementById(tabName);
        if (!activeContent) return;
        activeContent.classList.remove('hidden');

        // Появление элементов контента с задержкой 600мс между ними
        const elements = tabContentMap[tabName].map(id => document.getElementById(id)).filter(Boolean);
        fadeInSequence(elements, 600);
    }

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active')) return;

            // Снимаем active с всех кнопок, добавляем выбранной
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Показываем контент выбранного таба
            showTabContent(button.dataset.tab);
        });
    });

    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('open');
        });
    });
});