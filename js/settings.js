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

    // Массив месяцев
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Массив стран (пример, нужно добавить больше)
    const countries = [
        "United States", "Canada", "Russia", "Germany", "France", "China", "Japan", "Brazil", "Australia", "India", "South Korea", "Ukraine"
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