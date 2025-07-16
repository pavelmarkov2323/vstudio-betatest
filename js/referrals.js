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

  // Получить данные пользователя (в том числе реферальный код)
  fetch('/api/current-user')
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          // Пользователь не авторизован — заменить весь body на сообщение
          document.body.innerHTML = `
          <div class="not-auth-container">
            <img src="/assets/icons/notauth.png" alt="Not Auth" class="not-auth-icon"> 
            <div class="not-auth-text">
              <p class="not-auth-title theme-text">Register or log in to your account</p> 
              <a href="/auth.html" class="not-auth-button">Login or registration</a> 
            </div>
          </div>
        `;
          // Чтобы остановить дальнейшее выполнение
          throw new Error('Не авторизован');
        }
        throw new Error('Ошибка сети');
      }
      return res.json();
    })
    .then(user => {
      refCodeInput.value = user.referral_code || '';

      // Загружаем реферальную информацию
      return fetch('/api/referral/info');
    })
    .then(res => res.json())
    .then(data => {
      updateReferralInfo(data);
      toggleActivateCard(data);
      if (data.invitedUsersList) renderInvitedUsers(data.invitedUsersList);
    })
    .catch(err => {
      console.warn(err.message);
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