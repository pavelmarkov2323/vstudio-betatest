document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bg-music");
    const slider = document.getElementById("volume-slider");
    const volumeIcon = document.getElementById("volume-icon");

    const mobileSlider = document.getElementById("mobile-volume-slider");
    const mobilePanel = document.getElementById("mobile-volume-panel");

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

    // Синхронизация мобильного слайдера с основным при загрузке
    if (mobileSlider) {
        mobileSlider.value = slider.value;
    }

    window.addEventListener("resize", () => {
        if (window.innerWidth > 480 && mobilePanel) {
            mobilePanel.classList.remove("active");
        }
    });

    updateVolumeIcon();

    function updateSliderBackground() {
        const percent = slider.value;
        // Горизонтальная заливка для десктопа
        slider.style.background = `linear-gradient(to right, #3390EC ${percent}%, #ddd ${percent}%)`;

        if (mobileSlider) {
            const mobilePercent = mobileSlider.value;
            // Вертикальная заливка для мобилки — заливаем СНИЗУ ВВЕРХ
            mobileSlider.style.background = `linear-gradient(to top, #3390EC ${mobilePercent}%, #ddd ${mobilePercent}%)`;
        }
    }


    updateSliderBackground();
    audio.load();

    function startMusic() {
        audio.play().catch(() => console.log("Автовоспроизведение заблокировано"));
        document.removeEventListener("click", startMusic);
    }

    document.addEventListener("click", startMusic);

    // Функция синхронизации громкости между слайдерами и аудио
    function syncVolume(value) {
        slider.value = value;
        audio.volume = value / 100;
        if (mobileSlider) {
            mobileSlider.value = value;
        }
        localStorage.setItem("volume", value);
        if (value > 0) {
            lastVolume = value;
            localStorage.setItem("lastVolume", lastVolume);
        }
        updateVolumeIcon();
        updateSliderBackground();
    }

    // Клик по иконке — для мобилки показываем/скрываем панель, для ПК — mute/unmute
    volumeIcon.addEventListener("click", () => {
        const isMobile = window.innerWidth <= 480;

        if (isMobile && mobilePanel) {
            mobilePanel.classList.toggle("active");
        } else {
            const currentVolume = Number(slider.value);
            if (currentVolume > 0) {
                lastVolume = currentVolume;
                syncVolume(0);
            } else {
                syncVolume(lastVolume);
            }
        }
    });

    // Слушаем изменение основного слайдера
    slider.addEventListener("input", (event) => {
        const volume = Number(event.target.value);
        syncVolume(volume);
    });

    // Слушаем изменение мобильного слайдера
    if (mobileSlider) {
        mobileSlider.addEventListener("input", (event) => {
            const volume = Number(event.target.value);
            syncVolume(volume);
        });
    }

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