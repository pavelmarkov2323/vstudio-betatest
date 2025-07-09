document.addEventListener("DOMContentLoaded", () => {

  // Profile animation system
  const profileContainer = document.querySelector('.profile-container');

  // Bio / Text System
  const maxLength = 500;
  const editBtn = document.querySelector('.bio-edit-icon');
  const saveBtn = document.querySelector('.bio-save-icon');
  const bioText = document.querySelector('.bio-text');
  const bioInput = document.querySelector('.bio-input');
  const bioHint = document.querySelector('.bio-hint');
  const charCount = document.querySelector('.bio-char-count');

  // Avatar System
  const avatarInput = document.getElementById('avatar-upload');
  const avatarImage = document.querySelector('.profile-avatar');
  const editAvatarIcon = document.querySelector('.edit-avatar');

  // Плавная анимация появления профиля
  if (profileContainer) {
    // Немного задержки для плавности (можно убрать)
    setTimeout(() => {
      profileContainer.classList.add('visible');
    }, 100);
  }

  // Edit biography
  editBtn.addEventListener('click', () => {
    const textOnly = bioText.childNodes[0].textContent.trim();
    bioInput.value = textOnly;
    charCount.textContent = `${textOnly.length}/${maxLength}`;

    bioInput.style.display = 'block';
    bioHint.style.display = 'block';
    charCount.style.display = 'block';

    bioText.style.display = 'none';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'block';
  });

  saveBtn.addEventListener('click', () => {
    const newText = bioInput.value.trim();
    if (newText.length <= maxLength) {
      bioText.childNodes[0].textContent = newText;
      bioInput.style.display = 'none';
      bioText.style.display = 'inline';
      editBtn.style.display = 'inline';
      saveBtn.style.display = 'none';
      bioHint.style.display = 'none';
      charCount.style.display = 'none';
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

  // Глобальная утилита для перевода стран
  function translateCountry(countryName) {
    const translation = window.translations?.countries?.[countryName];
    return translation || countryName;
  }

  function updateCountryTranslation(user) {
    const countryElem = document.querySelector('.user-country');
    if (countryElem) {
      const country = user.country || 'Не указано';
      countryElem.textContent = translateCountry(country);
    }
  }

  // Функция статуса пользователя (user status)
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

  // Переменная для текущего пользователя (авторизованного)
  let currentUser = null;

  // Пользовательская часть с профилем
  const urlParts = window.location.pathname.split('/');
  const profileUsername = urlParts[urlParts.length - 1];

  // Получаем текущего пользователя, чтобы сверить с профилем
  fetch('/api/current-user', { credentials: 'include' })
    .then(res => {
      if (!res.ok) throw new Error('Не авторизован');
      return res.json();
    })
    .then(user => {
      currentUser = user;
    })
    .catch(() => {
      currentUser = null;
    })
    .finally(() => {
      loadProfile();
    });

  function loadProfile() {
    fetch(`/api/profile/${profileUsername}`, { credentials: 'include' })
      .then(response => response.json())
      .then(user => {
        if (user.username) {
          document.querySelector('.user-username').textContent = user.username;
          document.querySelector('.user-fullname').textContent = `${user.firstName} ${user.lastName}`;
          document.querySelector('.user-id').textContent = user.userId;
          document.querySelector('.user-username-inline').textContent = user.username;

          // Проверка на приветствие (Welcome)
          const welcomeHeading = document.getElementById('welcomeHeading');
          if (currentUser && currentUser.username === user.username) {
            welcomeHeading.style.display = 'block';
          } else {
            welcomeHeading.style.display = 'none';
          }

          // Обработка и обновления статуса пользователя
          const statusData = getStatusData(user.status, user.username);
          const userStatusWrapper = document.getElementById('user-status');
          const userStatusIcon = document.getElementById('user-status-icon');
          const tooltipStatusTitle = document.getElementById('tooltip-status-title');
          const tooltipStatusText = document.getElementById('tooltip-status-text');

          if (statusData && userStatusWrapper && userStatusIcon && tooltipStatusTitle && tooltipStatusText) {
            userStatusIcon.src = statusData.icon;
            tooltipStatusTitle.textContent = statusData.title;
            tooltipStatusText.innerHTML = statusData.text;
            userStatusWrapper.style.display = 'block';
          } else if (userStatusWrapper) {
            userStatusWrapper.style.display = 'none';
          }

          // Обработка данных пользователя из блока Details
          const birthdayElem = document.querySelector('.user-birthday');


          if (birthdayElem) {
            if (user.birth && user.birth.day && user.birth.month && user.birth.year) {
              // Преобразуем к формату DD.MM.YYYY
              const day = String(user.birth.day).padStart(2, '0');
              const month = String(user.birth.month).padStart(2, '0');
              const year = user.birth.year;

              birthdayElem.textContent = `${day}.${month}.${year}`;
            } else {
              birthdayElem.textContent = 'Не указано';
            }
          }

          // Обработка блока подписки
          const premiumCard = document.querySelector('.premium-subscribe-card');
          const premiumStatusElem = document.querySelector('.user-premium-status');
          const premiumTarifElem = document.querySelector('.user-premium-tarif-status');

          if (user.subscriptions && user.subscriptions.length > 0) {
            const now = new Date();
            const activeSub = user.subscriptions.find(sub => new Date(sub.expiresAt) > now);

            if (activeSub) {
              const expiresDate = new Date(activeSub.expiresAt);
              const formattedDate = expiresDate.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              premiumStatusElem.textContent = `Активна до ${formattedDate}`;

              const planMap = {
                '1m': { label: '1 месяц (Basic)', price: 80 },
                '3m': { label: '3 месяца (Standard)', price: 240 },
                '6m': { label: '6 месяцев (Pro)', price: 480 },
                '12m': { label: '12 месяцев (Ultimate)', price: 960 }
              };

              const formattedPlan = planMap[activeSub.plan]?.label || activeSub.plan;
              premiumTarifElem.textContent = formattedPlan;


              premiumCard.style.display = 'block';
            }
          }

          // Аватар
          avatarImage.src = user.avatar || '/assets/images/avatar/default.png';

          // Биография — показываем или ставим дефолтный текст
          bioText.childNodes[0].textContent = user.bio && user.bio.trim() !== '' ? user.bio :
            'Your biography will be here, but you don\'t have to fill it out. Everything is according to your choice — it\'s up to you to decide what your profile will look like.';

          // Показываем кнопку редактирования, если это текущий пользователь
          if (currentUser && currentUser.username === user.username) {
            editBtn.style.display = 'inline';
            saveBtn.style.display = 'none';

            editBtn.addEventListener('click', () => {
              const textOnly = bioText.childNodes[0].textContent.trim();
              bioInput.value = textOnly;
              charCount.textContent = `${textOnly.length}/${maxLength}`;

              bioInput.style.display = 'block';
              bioHint.style.display = 'block';
              charCount.style.display = 'block';

              bioText.style.display = 'none';
              editBtn.style.display = 'none';
              saveBtn.style.display = 'inline';
            });

            saveBtn.addEventListener('click', () => {
              const newText = bioInput.value.trim();
              if (newText.length <= maxLength) {
                // Отправляем на сервер
                fetch('/api/update-bio', {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ bio: newText }),
                })
                  .then(res => res.json())
                  .then(data => {
                    if (data.message === 'Биография обновлена') {
                      bioText.childNodes[0].textContent = newText || 'Your biography will be here, but you don\'t have to fill it out. Everything is according to your choice — it\'s up to you to decide what your profile will look like.';
                      bioInput.style.display = 'none';
                      bioText.style.display = 'inline';
                      editBtn.style.display = 'inline';
                      saveBtn.style.display = 'none';
                      bioHint.style.display = 'none';
                      charCount.style.display = 'none';
                    } else {
                      showModalMessage('Ошибка', 'Ошибка при сохранении биографии');
                    }
                  })
                  .catch(() => showModalMessage('Ошибка', 'Ошибка при сохранении биографиии'));
              }
            });
          } else {
            // Если чужой профиль — скрываем кнопки редактирования
            editBtn.style.display = 'none';
            saveBtn.style.display = 'none';
            bioInput.style.display = 'none';
            bioHint.style.display = 'none';
            charCount.style.display = 'none';
          }

          // Показываем/скрываем кнопку редактирования аватара
          if (currentUser && currentUser.username === user.username) {
            editAvatarIcon.style.display = 'inline-block';
            setupAvatarUpload(editAvatarIcon, avatarImage);
          } else {
            editAvatarIcon.style.display = 'none';
          }
        } else {
          document.body.innerHTML = `
    <div class="not-found-container">
      <img src="/assets/icons/notfound.png" alt="Not Found" class="not-found-icon">
      <div class="not-found-text">
        <p class="not-found-title theme-text">The user was not found</p>
        <a href="/home.html" class="home-button">Return back</a>
      </div>
    </div>
  `;
        }
      })
      .catch(error => {
        console.error('Ошибка при загрузке профиля:', error);
        document.body.innerHTML = '<p>Ошибка загрузки данных профиля</p>';
      });
  }

  // Обработка ввода в textarea биографии
  bioInput.addEventListener('input', () => {
    const len = bioInput.value.length;
    if (len > maxLength) {
      bioInput.value = bioInput.value.slice(0, maxLength);
    }
    charCount.textContent = `${bioInput.value.length}/${maxLength}`;
  });

  // Аватар
  editAvatarIcon.addEventListener('click', () => {
    avatarInput.click();
  });

  avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      avatarImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  function setupAvatarUpload(button, avatarImg) {
    const fileInput = document.getElementById('avatar-upload');

    button.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('avatar', file);

      fetch('/api/upload-avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.avatar) {
            avatarImg.src = data.avatar + '?t=' + Date.now();
          } else {
            showModalMessage('Ошибка', 'Ошибка при загрузке аватара');
          }
        })
        .catch(() => showModalMessage('Ошибка', 'Ошибка при загрузке аватара'));
    });
  }
});