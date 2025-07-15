window.addEventListener('load', () => {
  // Вставим HTML блока с ошибкой в конец body или в нужное место
  const errorHTML = `
    <div class="referals-error-card" style="display:none;">
      <div class="referals-error-icon">🔒</div>
      <div class="referals-error-content">
        <h2 class="referals-error-title">Для доступа необходимо авторизоваться</h2>
        <button class="referals-error-button" id="referalsLoginBtn">Войти</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', errorHTML); 

  const errorCard = document.querySelector('.referals-error-card');
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
  const referalContainer = document.getElementById('referal-container');
  const infosContainer = document.querySelector('.referals-card-infos');
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
    container.innerHTML = ''; // очистить перед добавлением новых

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

    // Показывать контейнер только если есть пользователи
    document.querySelector('.referals-card-inviteusers-container').style.display =
      users.length ? 'block' : 'none';
  }

  function toggleActivateCard(data) {
    if (data.activatedReferralCode && data.activatedReferralCode !== '') {
      activateCard.style.display = 'none';
    } else {
      activateCard.style.display = 'block';
    }
  }

  // Проверяем авторизацию и показываем интерфейс или ошибку
  fetch('/api/current-user')
    .then(res => res.json())
    .then(user => {
      if (!user || !user.id) {
        // Неавторизован — скрываем реферальные блоки
        if (referalContainer) referalContainer.style.display = 'none';
        if (infosContainer) infosContainer.style.display = 'none';
        if (inviteUsersContainer) inviteUsersContainer.style.display = 'none';
        if (activateCard) activateCard.style.display = 'none';

        // Показываем ошибку
        errorCard.style.display = 'flex';

        // Кнопка ведёт на страницу авторизации
        document.getElementById('referalsLoginBtn').addEventListener('click', () => {
          window.location.href = '/auth.html'; // или твой url для входа
        });

        return;
      }

      // Авторизован — показываем интерфейс
      errorCard.style.display = 'none';
      if (referalContainer) referalContainer.style.display = 'block';
      if (infosContainer) infosContainer.style.display = 'block';

      refCodeInput.value = user.referral_code || '';

      // Получить данные рефералов  
      fetch('/api/referral/info')
        .then(res => res.json())
        .then(data => {
          updateReferralInfo(data);
          toggleActivateCard(data);
          if (data.invitedUsersList) renderInvitedUsers(data.invitedUsersList);
        });
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
          // После успешной активации получить обновленные данные и обновить UI
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