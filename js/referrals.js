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
  const referralContainer = document.querySelector('.referral-container'); // основной контейнер
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
    // Скрываем реферальные блоки
    if (referralContainer) referralContainer.style.display = 'none';
    if (referalsCardInfos) referalsCardInfos.style.display = 'none';
    if (inviteUsersContainer) inviteUsersContainer.style.display = 'none';
    if (activateCard) activateCard.style.display = 'none';

    // Создаем блок с ошибкой
    const errorContainer = document.createElement('div');
    errorContainer.className = 'unauthorized-container';

    errorContainer.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF4D4F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="unauthorized-icon">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <p class="unauthorized-message">Вы должны быть авторизованы, чтобы видеть эту страницу.</p>
      <button class="unauthorized-btn">Войти / Зарегистрироваться</button>
    `;

    document.body.appendChild(errorContainer);

    errorContainer.querySelector('.unauthorized-btn').addEventListener('click', () => {
      window.location.href = '/auth.html';
    });
  }

  // Получаем данные текущего пользователя с проверкой авторизации
  fetch('/api/current-user')
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          // Не авторизован
          showUnauthorizedMessage();
          throw new Error('Не авторизован');
        } else {
          throw new Error('Ошибка сети');
        }
      }
      return res.json();
    })
    .then(user => {
      if (!user.referral_code) {
        // Если нет реферального кода, тоже считаем неавторизованным или пустым
        showUnauthorizedMessage();
        return;
      }

      refCodeInput.value = user.referral_code;

      fetch('/api/referral/info')
        .then(res => res.json())
        .then(data => {
          updateReferralInfo(data);
          toggleActivateCard(data);
          if (data.invitedUsersList) renderInvitedUsers(data.invitedUsersList);
        });
    })
    .catch(err => {
      console.log('Ошибка загрузки данных:', err.message);
      // Можно дополнительно показывать сообщение
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