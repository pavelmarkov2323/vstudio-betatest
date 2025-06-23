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
      alert('Введите имя и фамилию');
      return;
    }
    if (!['Male', 'Female'].includes(genderSelect.value)) {
      alert('Выберите пол');
      return;
    }
    if (!birthDay.value || !birthMonth.value || !birthYear.value) {
      alert('Выберите дату рождения');
      return;
    }
    if (!countrySelect.value) {
      alert('Выберите страну');
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (res.ok) {
        alert('Профиль сохранён');
      } else {
        alert(result.message || 'Ошибка');
      }
    } catch (err) {
      alert('Ошибка сети');
      console.error(err);
    }
  });
});