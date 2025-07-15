let observer; // глобально

window.addEventListener('load', () => {
  const sequence = [
    {
      parent: '.referals-card',
      children: [
        '.referals-program-heading',
        '.referals-program-description',
        '.referals-label',
        '.referals-code-input',
        '.referals-copy-btn'
      ]
    },
    {
      parent: '.referals-card-activate',
      children: [
        '.referals-activate-heading',
        '.referals-activate-description',
        '.referals-activate-code-input',
        '.referals-activate-btn'
      ]
    },
    {
      parent: '.referals-card-infos',
      children: [
        '.card-info-total-earned',
        '.referals-total-earned-label',
        '#total-earned',
        '.card-info-rate-per-user',
        '.referals-rate-per-user-label',
        '#rate-per-user',
        '.card-info-invited-users',
        '.referals-invited-users-label',
        '#invited-users'
      ]
    },
    {
      parent: '.referals-card-inviteusers',
      children: [
        '.inviteusers-title',
        '.inviteusers-divider'
      ]
    }
  ];

  // Присваиваем начальные стили (opacity: 0 и translateY)
  sequence.forEach(item => {
    const parentEl = document.querySelector(item.parent);
    if (parentEl) {
      parentEl.style.opacity = '0';
      parentEl.style.transform = 'translateY(20px)';
    } 

    item.children.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
      }
    });
  });

  let currentStep = 0;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = sequence[currentStep];
        const parentEl = document.querySelector(step.parent);

        if (entry.target === parentEl) {
          observer.unobserve(entry.target);
          animateStep(step, () => {
            currentStep++;
            const next = sequence[currentStep];
            if (next) {
              const nextParent = document.querySelector(next.parent);
              if (nextParent) observer.observe(nextParent);
            }
          });
        }
      }
    });
  }, { threshold: 0.3 });

  // Начинаем с первого реально отображаемого блока
  for (const step of sequence) {
    const parent = document.querySelector(step.parent);
    if (parent && getComputedStyle(parent).display !== 'none') {
      observer.observe(parent);
      break;
    }
  }

  function animateStep(step, callback) {
    const parentEl = document.querySelector(step.parent);
    if (parentEl) {
      parentEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      parentEl.style.opacity = '1';
      parentEl.style.transform = 'translateY(0)';
    }

    const delay = 300;
    step.children.forEach((selector, index) => {
      const el = document.querySelector(selector);
      if (el) {
        setTimeout(() => {
          el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay * (index + 1));
      }
    });

    const totalDelay = delay * (step.children.length + 1);
    setTimeout(() => {
      if (callback) callback();
    }, totalDelay);
  }


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
    const step = sequence.find(s => s.parent === '.referals-card-activate');

    if (data.activatedReferralCode && data.activatedReferralCode !== '') {
      activateCard.style.display = 'none';
      activateCard.classList.remove('visible');
    } else {
      activateCard.style.display = 'block';

      // Назначаем начальные стили, как у других шагов
      activateCard.style.opacity = '0';
      activateCard.style.transform = 'translateY(20px)';
      step.children.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
        }
      });

      // Ждём один тик, чтобы браузер успел применить стили, и подключаем к наблюдателю
      requestAnimationFrame(() => {
        observer.observe(activateCard);
      });
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