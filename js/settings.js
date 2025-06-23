document.addEventListener('DOMContentLoaded', () => {
    const firstNameInput = document.getElementById('firstNameInput');
    const lastNameInput = document.getElementById('lastNameInput');
    const genderSelect = document.getElementById('genderSelect');
    const birthDay = document.getElementById('birthDay');
    const birthMonth = document.getElementById('birthMonth');
    const birthYear = document.getElementById('birthYear');
    const countrySelect = document.getElementById('countrySelect');
    const saveButton = document.querySelector('.save-button');

    // Массив месяцев
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Массив стран (пример, нужно добавить больше)
    const countries = [
        "United States", "Canada", "Russia", "Germany", "France", "China", "Japan", "Brazil", "Australia", "India",
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
        countries.forEach(c => {
            const option = document.createElement('option');
            option.value = c;
            option.textContent = c;
            countrySelect.appendChild(option);
        });
    }

    fillBirthSelectors();
    fillCountries();

    // Загрузить текущие данные пользователя и подставить
    async function loadUserData() {
        try {
            const res = await fetch('/api/current-user');
            if (!res.ok) throw new Error('Не авторизован');
            const user = await res.json();

            firstNameInput.value = user.firstName || '';
            lastNameInput.value = user.lastName || '';
            genderSelect.value = user.gender || '';
            if (user.birth) {
                birthDay.value = user.birth.day || 'Day';
                birthMonth.value = user.birth.month || 'Month';
                birthYear.value = user.birth.year || 'Year';
            }
            countrySelect.value = user.country || '';
        } catch (err) {
            console.error(err);
            // Можно показать сообщение или редирект на логин
        }
    }

    loadUserData();

    saveButton.addEventListener('click', async () => {
        // Проверим, что выбраны все поля
        if (!firstNameInput.value.trim() || !lastNameInput.value.trim()) {
            showModalMessage('Ошибка', 'Введите имя и фамилию');
            return;
        }
        if (!['Male', 'Female'].includes(genderSelect.value)) {
            showModalMessage('Ошибка', 'Выберите пол');
            return;
        }
        if (!birthDay.value || !birthMonth.value || !birthYear.value) {
            showModalMessage('Ошибка', 'Выберите дату рождения');
            return;
        }
        if (!countrySelect.value) {
            showModalMessage('Ошибка', 'Выберите страну');
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
                showModalMessage('Успех', 'Профиль сохранён');
                // Через небольшой таймаут перенаправим на страницу профиля
                setTimeout(() => {
                    window.location.href = `/profile/${result.username}`;
                }, 1500);
            } else {
                showModalMessage('Ошибка', result.message || 'Ошибка');
            }
        } catch (err) {
            showModalMessage('Ошибка', 'Ошибка сети');
            console.error(err);
        }
    });

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