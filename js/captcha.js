document.addEventListener("DOMContentLoaded", function () {
    // Проверяем, загружены ли переводы
    if (window.translations) {
        initCaptchaModal();
    } else {
        document.addEventListener("languageReady", initCaptchaModal);
    }
});

function initCaptchaModal() {
    // Динамически вставляем HTML модального окна капчи
    const modalHTML = `
    <div id="captchaModal" class="captcha-modal" style="display: none;">
        <div class="captcha-content">
            <img src="/assets/icons/robot.png" alt="Icon" class="captcha-icon">
            <p class="captcha-title theme-text">${window.translations["captcha-content"]["captcha-title"]}</p>
            <label for="robotCheck" class="captcha-label">
                <div class="checkbox-container">
                    <input type="checkbox" id="robotCheck" onclick="validateCaptcha()">
                </div>
                <div class="captcha-text-container theme-text">${window.translations["captcha-content"]["captcha-text-container"]}</div>
            </label>
            <div class="loader-container" style="display: none;">
                <span class="loader"></span>
            </div>
            <p class="captcha-footer gray-text">${window.translations["captcha-content"]["captcha-footer"]}</p>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    setupCaptchaLogic();
}

function setupCaptchaLogic() {
    const captchaModal = document.getElementById('captchaModal');

    // Получаем количество посещений страницы из localStorage
    let visitCount = localStorage.getItem('visitCount') ? parseInt(localStorage.getItem('visitCount')) : 0;

    // Увеличиваем счётчик посещений
    visitCount++;
    localStorage.setItem('visitCount', visitCount);

    // Показываем капчу, если посещений >= 8
    if (visitCount >= 8) {
        captchaModal.style.display = "flex";
    }
}

function validateCaptcha() {
    const checkBox = document.getElementById('robotCheck');
    const captchaModal = document.getElementById('captchaModal');
    const captchaLabel = document.querySelector('.captcha-label');
    const loaderContainer = document.querySelector('.loader-container');

    if (checkBox.checked) {
        captchaLabel.style.display = 'none';
        loaderContainer.style.display = 'block';

        setTimeout(() => {
            captchaModal.classList.add('fadeOut');
        }, 2000);

        setTimeout(() => {
            captchaModal.style.display = 'none';
            localStorage.setItem('visitCount', 0);
        }, 2500);
    }
}