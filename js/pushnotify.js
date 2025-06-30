document.addEventListener("DOMContentLoaded", () => {
    const pushNotify = document.getElementById("pushNotify");
    const pushContent1 = document.getElementById("pushContent1");
    const pushContent2 = document.getElementById("pushContent2");
    let activeContent = null;
    let timer;
    let isTransitioning = false;

    // Функция для показа уведомления по id
    function showNotificationById(contentId) {
        console.log('showNotificationById'); // Отладочное сообщение

        if (isTransitioning) return; // Если идет анимация, не показываем новое уведомление

        // Скрываем текущее уведомление, если оно есть
        if (activeContent) {
            isTransitioning = true; // Включаем флаг анимации
            activeContent.classList.remove("show"); // Скрыть текущее уведомление
            setTimeout(() => {
                activeContent.style.display = 'none'; // Скрыть из DOM, после того как оно исчезло
                isTransitioning = false; // Сбрасываем флаг анимации
            }, 500); // Задержка для плавного скрытия
        }

        // После того как старое уведомление исчезло, показываем новое
        setTimeout(() => {
            if (contentId === 'pushContent1') {
                activeContent = pushContent1;
            } else if (contentId === 'pushContent2') {
                activeContent = pushContent2;
            }

            // Показываем выбранный блок
            activeContent.style.display = 'block'; // Показать новый контент
            setTimeout(() => {
                activeContent.classList.add("show"); // Анимируем его появление
            }, 10);

            // Показываем родительский блок уведомления
            pushNotify.classList.add("show");

            // Задаем таймер для скрытия уведомления через 10 секунд
            timer = setTimeout(hideNotification, 15000); // 15 секунд
        }, 500); // Пауза для завершения анимации исчезновения старого уведомления
    }

    // Функция скрытия уведомления
    function hideNotification() {
        console.log('hideNotification'); // Отладочное сообщение

        // Скрываем текущий контент уведомления
        if (activeContent) {
            activeContent.classList.remove("show");
            activeContent.style.display = 'none'; // Скрыть контент
            pushNotify.classList.remove("show");
        }

        clearTimeout(timer);

        // После завершения анимации скрытия, показываем следующее уведомление через 5 секунд
        setTimeout(() => {
            const nextId = Math.random() > 0.5 ? 'pushContent1' : 'pushContent2';
            showNotificationById(nextId); // Показываем следующее уведомление
        }, 900000); // 15 минут после завершения анимации
    }

    // Закрытие уведомления при клике
    document.querySelectorAll(".push-close").forEach(button => {
        button.addEventListener("click", hideNotification);
    });

    // Обработчик для кнопки "Предложить" (открывает email)
    document.getElementById("emailButton").addEventListener("click", () => {
        window.location.href = "mailto:valeyevstudio@gmail.com";
    });

    // Обработчик для кнопки "Поддержать" (открывает Donation Alerts)
    document.getElementById("donateButton").addEventListener("click", () => {
        window.open("https://www.donationalerts.com/r/valeyevboss", "_blank");
    });

    // Первый запуск уведомления
    setTimeout(() => {
        const firstId = Math.random() > 0.5 ? 'pushContent1' : 'pushContent2';
        showNotificationById(firstId); // Запускаем первое уведомление
    }, 20000); // Запускаем первое уведомление через 20 секунд
});
