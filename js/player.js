document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bg-music");
    const slider = document.getElementById("volume-slider");
    const volumeIcon = document.getElementById("volume-icon");

    const tracks = [
        "/assets/sound/startup_01.mp3"
    ];
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    audio.src = randomTrack;

    let lastVolume = 100;

    // Проверка сохранённой громкости
    const savedVolume = localStorage.getItem("volume");
    const savedLastVolume = localStorage.getItem("lastVolume");

    if (savedVolume !== null) {
        slider.value = savedVolume;
        audio.volume = savedVolume / 100;

        if (savedVolume > 0) {
            lastVolume = savedVolume;
        } else if (savedLastVolume !== null) {
            lastVolume = savedLastVolume;
        }
    } else {
        slider.value = 100;
        audio.volume = 1;
    }

    updateVolumeIcon();

    function updateSliderBackground() {
        const percent = slider.value;
        slider.style.background = `linear-gradient(to right, #447BBA ${percent}%, #ddd ${percent}%)`;
    }

    updateSliderBackground();
    audio.load();

    function startMusic() {
        audio.play().catch(() => console.log("Автовоспроизведение заблокировано"));
        document.removeEventListener("click", startMusic);
    }

    document.addEventListener("click", startMusic);

    // Клик по иконке — mute / unmute
    volumeIcon.addEventListener("click", () => {
        const currentVolume = Number(slider.value);

        if (currentVolume > 0) {
            // Запоминаем и ставим 0
            lastVolume = currentVolume;
            slider.value = 0;
            audio.volume = 0;
        } else {
            // Восстанавливаем
            slider.value = lastVolume;
            audio.volume = lastVolume / 100;
        }

        // Обновить отображение
        updateVolumeIcon();
        updateSliderBackground();
        localStorage.setItem("volume", slider.value);
    });

    // Слушаем изменение слайдера
    slider.addEventListener("input", (event) => {
        const volume = Number(event.target.value);
        audio.volume = volume / 100;
        localStorage.setItem("volume", volume);

        if (volume > 0) {
            lastVolume = volume;
            localStorage.setItem("lastVolume", lastVolume);
        }

        updateVolumeIcon();
        updateSliderBackground();
    });

    function updateVolumeIcon() {
        const volume = Number(slider.value);
        if (volume === 0) {
            volumeIcon.src = "/assets/icons/player/volume-mute.svg";
        } else if (volume < 80) {
            volumeIcon.src = "/assets/icons/player/volume-down.svg";
        } else {
            volumeIcon.src = "/assets/icons/player/volume.svg";
        }
    }
});