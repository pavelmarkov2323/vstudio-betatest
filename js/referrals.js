let observer;

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

  // Установим начальные стили всем элементам
  sequence.forEach(({ parent, children }) => {
    const parentEl = document.querySelector(parent);
    if (parentEl) {
      Object.assign(parentEl.style, {
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease'
      });
    }
    children.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        Object.assign(el.style, {
          opacity: '0',
          transform: 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease'
        });
      }
    });
  });

  let currentStep = 0;

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = sequence[currentStep];
        const parentEl = document.querySelector(step.parent);

        if (entry.target === parentEl) {
          observer.unobserve(parentEl);
          animateStep(step, () => {
            currentStep++;
            const nextStep = sequence[currentStep];
            if (nextStep) {
              const nextParent = document.querySelector(nextStep.parent);
              if (nextParent) observer.observe(nextParent);
            }
          });
        }
      }
    });
  }, { threshold: 0.3 });

  // Стартуем с первого видимого блока
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
      parentEl.style.opacity = '1';
      parentEl.style.transform = 'translateY(0)';
    }

    const delay = 300;
    step.children.forEach((selector, index) => {
      const el = document.querySelector(selector);
      if (el) {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay * (index + 1));
      }
    });

    setTimeout(callback, delay * (step.children.length + 1));
  }

  const refCodeInput = document.getElementById('ref-code');
  const copyBtn = document.querySelector('.referals-copy-btn');
  const activateBtn = document.querySelector('.referals-activate-btn');
  const activateInput = document.querySelector('.referals-activate-code-input');
  const activateCard = document.querySelector('.referals-card-activate');

  const infos = {
    totalEarned: document.getElementById('total-earned'),
    ratePerUser: document.getElementById('rate-per-user'),
    invitedUsers: document.getElementById('invited-users'),
  };

  const formatNumber = val => Number(val || 0).toLocaleString();

  function updateReferralInfo(data) {
    infos.totalEarned.textContent = formatNumber(data.totalEarned);
    infos.ratePerUser.textContent = formatNumber(data.ratePerUser || 1);
    infos.invitedUsers.textContent = formatNumber(data.invitedUsers);
  }

  function renderInvitedUsers(users = []) {
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

    document.querySelector('.referals-card-inviteusers-container').style.display =
      users.length ? 'block' : 'none';
  }

  function toggleActivateCard(data) {
    const step = sequence.find(s => s.parent === '.referals-card-activate');
    const isActivated = !!data.activatedReferralCode;

    activateCard.style.display = isActivated ? 'none' : 'block';

    if (!isActivated) {
      // Сброс стилей
      activateCard.style.opacity = '0';
      activateCard.style.transform = 'translateY(20px)';
      step.children.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
        }
      });

      requestAnimationFrame(() => {
        observer.observe(activateCard);
      });
    }
  }

  // Загрузка данных
  fetch('/api/current-user')
    .then(res => res.json())
    .then(user => {
      refCodeInput.value = user.referral_code || '';
      return fetch('/api/referral/info');
    })
    .then(res => res.json())
    .then(data => {
      updateReferralInfo(data);
      toggleActivateCard(data);
      renderInvitedUsers(data.invitedUsersList);
    });

  // Копирование кода
  copyBtn.addEventListener('click', () => {
    refCodeInput.select();
    document.execCommand('copy');
    alert('Referral code copied!');
  });

  // Активация
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
        alert(data.message || 'Готово!');
        if (!data.message.toLowerCase().includes('ошибка')) {
          return fetch('/api/referral/info')
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