document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bg-music");
    const slider = document.getElementById("volume-slider");
    const volumeIcon = document.getElementById("volume-icon");

    // Список доступных треков
    const tracks = [
        "/assets/sound/startup_01.mp3",
        "/assets/sound/startup_02.mp3"
    ];

    // Выбираем случайный трек
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    audio.src = randomTrack;

    // Проверяем сохранённую громкость
    const savedVolume = localStorage.getItem("volume");
    if (savedVolume !== null) {
        slider.value = savedVolume;
        audio.volume = savedVolume / 100;
    } else {
        slider.value = 100;
        audio.volume = 1;
    }

    // Функция обновления фона слайдера
    function updateSliderBackground() {
        let percent = slider.value;
        slider.style.background = `linear-gradient(to right, #447BBA ${percent}%, #ddd ${percent}%)`;
    }

    // Вызываем при загрузке
    updateSliderBackground();

    // Попытка загрузки музыки заранее
    audio.load();

    // Запуск музыки только после клика пользователя
    function startMusic() {
        audio.play().catch(() => console.log("Автовоспроизведение заблокировано"));
        document.removeEventListener("click", startMusic);
    }

    document.addEventListener("click", startMusic);

    // Обработчик изменения громкости
    slider.addEventListener("input", (event) => {
        const volume = event.target.value;
        audio.volume = volume / 100;
        localStorage.setItem("volume", volume);

        // Меняем иконку в зависимости от громкости
        if (volume == 0) {
            volumeIcon.src = "/assets/icons/player/volume-mute.svg";
        } else if (volume < 80) {
            volumeIcon.src = "/assets/icons/player/volume-down.svg";
        } else {
            volumeIcon.src = "/assets/icons/player/volume.svg";
        }

        // Обновляем активный фон
        updateSliderBackground();
    });
});