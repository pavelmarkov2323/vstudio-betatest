document.addEventListener('DOMContentLoaded', () => {
    let currentUser = null;

    const firstNameInput = document.getElementById('firstNameInput');
    const lastNameInput = document.getElementById('lastNameInput');
    const genderSelect = document.getElementById('genderSelect');
    const birthDay = document.getElementById('birthDay');
    const birthMonth = document.getElementById('birthMonth');
    const birthYear = document.getElementById('birthYear');
    const countrySelect = document.getElementById('countrySelect');
    const saveButton = document.querySelector('.save-button');

    const sidebarItems = document.querySelectorAll(".settings-sidebar .sidebar-item");
    const welcomeCard = document.querySelector(".settings-card-welcome");
    const settingsCard = document.querySelector(".settings-card");
    const secureCard = document.querySelector(".secure-card");
    const secureCardDevicyandActivity = document.querySelector(".secure-device-activity-card");

    const welcomeFullname = document.querySelector('.settings-card-welcome .user-fullname');
    const welcomeUserId = document.querySelector('.settings-card-welcome .user-id');
    const welcomeAvatar = document.querySelector('.settings-card-welcome .profile-avatar-img');

    // Изначально скрываем settingsCard
    settingsCard.style.display = "none";
    secureCard.style.display = "none";
    secureCardDevicyandActivity.style.display = "none";

    sidebarItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            // Удаляем класс active у всех
            sidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            // Переключение контента
            if (index === 0) {
                // Главная
                welcomeCard.style.display = "flex";
                settingsCard.style.display = "none";
                secureCard.style.display = "none";
                secureCardDevicyandActivity.style.display = "none";
            } else if (index === 1) {
                // Данные
                welcomeCard.style.display = "none";
                settingsCard.style.display = "block";
                secureCard.style.display = "none";
                secureCardDevicyandActivity.style.display = "none";
            } else if (index === 2) {
                secureCard.style.display = "block";
                secureCardDevicyandActivity.style.display = "block";
                welcomeCard.style.display = "none";
                settingsCard.style.display = "none";

                // Загружаем устройства
                fetchDevices();
            }
        });
    });

    // Массив месяцев
    const months = [
        '1', '2', '3', '4', '5', '6',
        '7', '8', '9', '10', '11', '12'
    ];

    // Массив стран (пример, нужно добавить больше)
    const countries = [
        "United States", "Russia", "Ukraine", "Belarus", "Kazakhstan", "Georgia", "Poland", "Germany", "Spain", "France", "Finland", "South Korea",
        "China"
        // ...добавьте сюда полный список стран
    ];

    // Заполнить селекты дней (1-31), месяцев, годов (например, 1900-2025)
    function fillBirthSelectors() {
        for (let d = 1; d <= 31; d++) {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = d;
            birthDay.appendChild(option);
        }

        months.forEach(m => {
            const option = document.createElement('option');
            option.value = m;
            option.textContent = m;
            birthMonth.appendChild(option);
        });

        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= 1900; y--) {
            const option = document.createElement('option');
            option.value = y;
            option.textContent = y;
            birthYear.appendChild(option);
        }
    }

    // Заполнить страны
    function fillCountries() {
        const countryTranslations = window.translations?.countries || {}; // или window.country?.countries

        countries.forEach(c => {
            const option = document.createElement('option');
            option.value = c;
            option.textContent = countryTranslations[c] || c; // Если перевода нет — используем оригинал
            countrySelect.appendChild(option);
        });
    }

    fillBirthSelectors();

    document.addEventListener("languageReady", () => {
        fillCountries();
        loadUserData(); // <- тоже можно вызывать тут, чтобы значения точно были подставлены после перевода
    });

    // Статус верификации
    function getStatusData(status, username) {
        const statusData = {
            1: {
                icon: '/assets/icons/status/verified.gif',
                title: 'Верифицированная страница',
                text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">верификации</a>.`
            },
            2: {
                icon: '/assets/icons/status/sponsor.png',
                title: 'Страница спонсора',
                text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">спонсорстве</a>.`
            },
            3: {
                icon: '/assets/icons/status/partner.png',
                title: 'Страница партнёра',
                text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">партнёрке</a>.`
            },
            4: {
                icon: '/assets/icons/status/moderator.png',
                title: 'Модератор подтверждён',
                text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">модераторстве</a>.`
            },
            5: {
                icon: '/assets/icons/status/admin.png',
                title: 'Администратор верифицирован',
                text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">верификации администраторов</a>.`
            }
        };
        return statusData[status] || null;
    }


    // Загрузить текущие данные пользователя и подставить
    async function loadUserData() {
        try {
            const res = await fetch('/api/current-user');
            if (!res.ok) throw new Error('Не авторизован');
            currentUser = await res.json();

            firstNameInput.value = currentUser.firstName || '';
            lastNameInput.value = currentUser.lastName || '';
            genderSelect.value = currentUser.gender || '';
            if (currentUser.birth) {
                birthDay.value = currentUser.birth.day || 'Day';
                birthMonth.value = currentUser.birth.month || 'Month';
                birthYear.value = currentUser.birth.year || 'Year';
            }
            countrySelect.value = currentUser.country || '';

            // Обновляем приветствие
            if (welcomeFullname && welcomeUserId && welcomeAvatar) {
                welcomeFullname.textContent = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'No name';
                welcomeUserId.textContent = currentUser.userId || '';
                welcomeAvatar.src = currentUser.avatar || 'https://res.cloudinary.com/dqceexk1h/image/upload/v1750689301/default.png';

                // Теперь обновляем статус
                const userStatusWrapper = document.getElementById('user-status');
                const userStatusIcon = document.getElementById('user-status-icon');
                const tooltipStatusTitle = document.getElementById('tooltip-status-title');
                const tooltipStatusText = document.getElementById('tooltip-status-text');

                const statusData = getStatusData(currentUser.status, currentUser.username);

                if (statusData && userStatusWrapper && userStatusIcon && tooltipStatusTitle && tooltipStatusText) {
                    userStatusIcon.src = statusData.icon;
                    tooltipStatusTitle.textContent = statusData.title;
                    tooltipStatusText.innerHTML = statusData.text;
                    userStatusWrapper.style.display = 'inline-block';
                } else if (userStatusWrapper) {
                    userStatusWrapper.style.display = 'none';
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    loadUserData();
    saveButton.addEventListener('click', async () => {
        // Проверим, что выбраны все поля
        if (!firstNameInput.value.trim() || !lastNameInput.value.trim()) {
            showModalMessage('Error', 'Enter your first and last name');
            return;
        }
        if (!['Male', 'Female'].includes(genderSelect.value)) {
            showModalMessage('Error', 'Choose a gender');
            return;
        }
        if (!birthDay.value || !birthMonth.value || !birthYear.value) {
            showModalMessage('Error', 'Select the date of birth');
            return;
        }
        if (!countrySelect.value) {
            showModalMessage('Error', 'Select a country');
            return;
        }

        const data = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            gender: genderSelect.value,
            birth: {
                day: parseInt(birthDay.value),
                month: birthMonth.value,
                year: parseInt(birthYear.value),
            },
            country: countrySelect.value,
        };

        try {
            const res = await fetch('/api/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (res.ok) {
                showModalMessage('Profile Update', 'Your settings have been saved successfully.');
                // Через небольшой таймаут перенаправим на страницу профиля
                setTimeout(() => {
                    window.location.href = `/profile/${currentUser.username}`;
                }, 1500);
            } else {
                showModalMessage('Error', result.message || 'Error');
            }
        } catch (err) {
            showModalMessage('Error', 'Network error');
            console.error(err);
        }
    });

    async function fetchDevices() {
        const res = await fetch('/api/user/devices', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        const devices = await res.json();
        renderDevices(devices);
    }

    function renderDevices(devices) {
        const container = document.querySelector('.other-devices');
        if (!container) return;

        container.innerHTML = '<h4 class="section-subtitle">Другие устройства</h4>';

        const currentDeviceId = getCurrentDeviceId();

        devices.forEach(device => {
            const div = document.createElement('div');
            div.className = 'device-entry';
            div.onclick = () => openDeviceModal(device);
            div.innerHTML = `
      <div class="device-icon">
        <div class="device-icon-bg">
          <img src="/assets/icons/${device.isMobile ? 'mobile' : 'pc'}.svg">
        </div>
      </div>
      <div class="device-texts">
        <div class="device-title">${device.deviceName || `${device.os} · ${device.browser}`}</div>
        <div class="device-meta">${device.location} · ${new Date(device.lastActive).toLocaleString()}</div>
        ${device.deviceId === currentDeviceId ? '<div class="device-current-label">Это устройство</div>' : ''}
      </div>
    `;
            container.appendChild(div);
        });
    }

    function logoutAllDevices() {
        fetch('/api/user/devices/logout-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ currentDeviceId: getCurrentDeviceId() })
        }).then(() => fetchDevices());
    }

    function getCurrentDeviceId() {
        let id = localStorage.getItem('device_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('device_id', id);
        }
        return id;
    }

    function openDeviceModal(device) {
        // Пока можно просто показать alert — потом сделаем полноценную модалку
        alert(`Устройство: ${device.deviceName || device.browser}\nIP: ${device.ip}\nПоследняя активность: ${new Date(device.lastActive).toLocaleString()}`);
    }


    // Модальное окно сообщений
    function showModalMessage(title, message) {
        // Удалим предыдущую модалку, если она есть
        const oldModal = document.querySelector('.modal-message-overlay');
        if (oldModal) oldModal.remove();

        // Создаем HTML модалки
        const modal = document.createElement('div');
        modal.className = 'modal-message-overlay';
        modal.innerHTML = `
    <div class="modal-message-window">
      <button class="modal-message-close">&times;</button>
      <h2 class="modal-message-title theme-text">${title}</h2>
      <p class="modal-message-message theme-text">${message}</p>
    </div>
  `;
        // Добавляем в DOM
        document.body.appendChild(modal);

        // Обработчик закрытия
        modal.querySelector('.modal-message-close').addEventListener('click', () => {
            modal.remove();
        });
    }
});