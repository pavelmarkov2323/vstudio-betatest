window.addEventListener('load', () => {
  const refCodeInput = document.getElementById('ref-code');
  const copyBtn = document.querySelector('.referals-copy-btn');
  const activateBtn = document.querySelector('.referals-activate-btn');
  const activateInput = document.querySelector('.referals-activate-code-input');
  const infos = {
    totalEarned: document.getElementById('total-earned'),
    ratePerUser: document.getElementById('rate-per-user'),
    invitedUsers: document.getElementById('invited-users'),
  };
  const activateCard = document.querySelector('.referals-card-activate');
  const referralContainer = document.querySelector('.referral-container');
  const referalsCardInfos = document.querySelector('.referals-card-infos');
  const inviteUsersContainer = document.querySelector('.referals-card-inviteusers-container');

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function updateReferralInfo(data) {
    infos.totalEarned.textContent = formatNumber(data.totalEarned);
    infos.ratePerUser.textContent = formatNumber(data.ratePerUser || 1);
    infos.invitedUsers.textContent = formatNumber(data.invitedUsers);
  }

  function renderInvitedUsers(users) {
    const container = document.querySelector('.referals-card-inviteusers');
    container.innerHTML = '';

    users.forEach((user, index) => {
      const div = document.createElement('div');
      div.className = 'invite-user top-card';
      div.innerHTML = `
      <span class="invite-index theme-text">#${index + 1}</span>
      <img class="invite-avatar" src="${user.avatar}" alt="Avatar">
      <div class="invite-info">
          <span class="invite-id">ID: ${user.userId}</span>
          <span class="invite-username theme-text">@${user.username}</span>
      </div>
    `;
      container.appendChild(div);
    });

    inviteUsersContainer.style.display = users.length ? 'block' : 'none';
  }

  function toggleActivateCard(data) {
    if (data.activatedReferralCode && data.activatedReferralCode !== '') {
      activateCard.style.display = 'none';
    } else {
      activateCard.style.display = 'block';
    }
  }

  function showUnauthorizedMessage() {
    // Скрываем основные блоки
    referralContainer.style.display = 'none';
    referalsCardInfos.style.display = 'none';
    inviteUsersContainer.style.display = 'none';
    activateCard.style.display = 'none';

    // Создаем контейнер для ошибки
    const errorContainer = document.createElement('div');
    errorContainer.className = 'unauthorized-container';

    // SVG иконка (пример простой иконки "замка")
    const svgIcon = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF4D4F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="unauthorized-icon">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>`;

    errorContainer.innerHTML = `
      ${svgIcon}
      <p class="unauthorized-message">Вы должны быть авторизованы, чтобы видеть эту страницу.</p>
      <button class="unauthorized-btn">Войти / Зарегистрироваться</button>
    `;

    // Вставляем в body или другой контейнер на странице
    document.body.appendChild(errorContainer);

    // Обработчик кнопки перехода
    errorContainer.querySelector('.unauthorized-btn').addEventListener('click', () => {
      window.location.href = '/auth.html';
    });
  }

  // Получить данные пользователя (в том числе реферальный код)
  fetch('/api/current-user')
    .then(res => res.json())
    .then(user => {
      if (!user || !user.referral_code) {
        showUnauthorizedMessage();
        return;
      }

      refCodeInput.value = user.referral_code || '';

      fetch('/api/referral/info')
        .then(res => res.json())
        .then(data => {
          updateReferralInfo(data);
          toggleActivateCard(data);
          if (data.invitedUsersList) renderInvitedUsers(data.invitedUsersList);
        });
    })
    .catch(() => {
      // Если ошибка с сервером, тоже показываем сообщение
      showUnauthorizedMessage();
    });

  // Копировать реферальный код
  copyBtn.addEventListener('click', () => {
    refCodeInput.select();
    document.execCommand('copy');
    alert('Referral code copied!');
  });

  // Активация кода
  activateBtn.addEventListener('click', () => {
    const code = activateInput.value.trim();
    if (!code) {
      alert('Введите код для активации');
      return;
    }

    fetch('/api/referral/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) alert(data.message);
        if (!data.message.toLowerCase().includes('ошибка')) {
          fetch('/api/referral/info')
            .then(res => res.json())
            .then(data => {
              updateReferralInfo(data);
              toggleActivateCard(data);
            });
        }
      })
      .catch(() => alert('Ошибка сервера'));
  });
});