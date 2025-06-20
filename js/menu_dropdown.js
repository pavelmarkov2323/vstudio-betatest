document.addEventListener("DOMContentLoaded", function() {
    const productsBtn = document.querySelector(".nav-our-products");
    const menu = document.getElementById("productsMenu");
    const overlay = document.querySelector(".overlay");

    // Показываем меню и фон
    function showMenu() {
        setTimeout(() => {
            menu.classList.add("active");
            overlay.classList.add("active");
        }, 100); // Небольшой таймаут перед активацией фона
    }

    // Скрываем меню и фон
    function hideMenu() {
        menu.classList.remove("active");
        overlay.classList.remove("active");
    }

    // Показываем меню при наведении на кнопку или меню
    productsBtn.addEventListener("mouseenter", showMenu);
    menu.addEventListener("mouseenter", showMenu);

    // Проверка для скрытия меню, если курсор ушел и с кнопки, и с меню
    productsBtn.addEventListener("mouseleave", function() {
        setTimeout(() => {
            if (!menu.matches(":hover") && !productsBtn.matches(":hover")) {
                hideMenu();
            }
        }, 200); // Задержка перед скрытием
    });

    // Скрываем меню, если курсор покидает меню и не находится на дочернем элементе
    menu.addEventListener("mouseleave", function() {
        setTimeout(() => {
            if (!menu.matches(":hover") && !productsBtn.matches(":hover")) {
                hideMenu();
            }
        }, 200); // Задержка перед скрытием
    });

    // Не скрывать меню, если курсор находится на дочерних элементах menu
    menu.querySelectorAll('.product-item').forEach(item => {
        item.addEventListener("mouseenter", function(e) {
            e.stopPropagation(); // Останавливаем всплытие событий
        });
    });
});
