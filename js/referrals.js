window.addEventListener('load', () => {
  const referalsCard = document.querySelector('.referals-card');
  const cardActivate = document.querySelector('.referals-card-activate');
  const infosCard = document.querySelector('.referals-card-infos');
  const inviteUsersBlock = document.querySelector('.referals-card-inviteusers');

  const animationSequence = [
    document.querySelector('.referals-total-earned-label'),
    document.getElementById('total-earned'),
    document.querySelector('.referals-rate-per-user-label'),
    document.getElementById('rate-per-user'),
    document.querySelector('.referals-invited-users-label'),
    document.getElementById('invited-users'),
  ];

  // 1. Observer для главного блока
  const observerReferalsCard = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        referalsCard.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  // 2. Observer для блока активации
  const observerCardActivate = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cardActivate.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  // 3. Observer для блока с карточками
  const observerInfosCard = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = infosCard.querySelectorAll('.referals-card-info');

        // Появление каждой карточки по одной через класс .visible
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('visible');
          }, index * 400); // 0.4s между карточками
        });

        // Появление лейблов и значений (value + label)
        animationSequence.forEach((el, index) => {
          if (el) {
            el.style.opacity = 0;
            el.style.animation = `fadeUp 0.6s ease forwards`;
            el.style.animationDelay = `${(cards.length * 0.4 + index * 0.3)}s`;
          }
        });

        // Появление inviteUsersBlock — в конце
        const totalDelay = cards.length * 0.4 + animationSequence.length * 0.3 + 0.6;
        setTimeout(() => {
          if (inviteUsersBlock) {
            inviteUsersBlock.classList.add('visible');
          }
        }, totalDelay * 1000);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  // Наблюдение
  if (referalsCard) observerReferalsCard.observe(referalsCard);
  if (cardActivate) observerCardActivate.observe(cardActivate);
  if (infosCard) observerInfosCard.observe(infosCard);

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
      activateCard.style.display = '';
    }
  }

  // Получить данные пользователя (в том числе реферальный код)
  fetch('/api/current-user')
    .then(res => res.json())
    .then(user => {
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