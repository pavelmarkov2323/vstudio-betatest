document.addEventListener("DOMContentLoaded", function () {
    const captchaModal = document.getElementById('captchaModal');

    // Получаем количество посещений страницы из localStorage
    let visitCount = localStorage.getItem('visitCount') ? parseInt(localStorage.getItem('visitCount')) : 0;

    // Увеличиваем счётчик посещений
    visitCount++;
    localStorage.setItem('visitCount', visitCount);

    // Показываем капчу только при 3-м посещении
    if (visitCount >= 8) {
        captchaModal.style.display = "flex";
    }
});

function validateCaptcha() {
    const checkBox = document.getElementById('robotCheck');
    const captchaModal = document.getElementById('captchaModal');
    const captchaLabel = document.querySelector('.captcha-label');
    const loaderContainer = document.querySelector('.loader-container');

    if (checkBox.checked) {
        captchaLabel.style.display = 'none';
        loaderContainer.style.display = 'block';

        setTimeout(function() {
            captchaModal.classList.add('fadeOut');
        }, 2000);

        setTimeout(function() {
            captchaModal.style.display = 'none';
            localStorage.setItem('visitCount', 0); // Сбрасываем счётчик после прохождения капчи
        }, 2500);
    }
}
