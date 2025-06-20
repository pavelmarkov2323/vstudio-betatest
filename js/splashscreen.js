document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const logo = document.querySelector(".logo");
        const text = document.querySelector(".text");

        // Легкий прыжок логотипа перед уменьшением
        logo.style.transform = "scale(1.2)";

        setTimeout(() => {
            logo.style.transform = "scale(0.8) translateX(-30px)"; // Смещаем аккуратно влево
            text.style.opacity = "1";
            text.style.transform = "translateX(-10px) scale(1)"; // Тянем текст ближе к логотипу

            // Плавный переход на основную страницу
            setTimeout(() => {
                window.location.href = "home.html";
            }, 1500);
        }, 300);
    }, 1000);
});
