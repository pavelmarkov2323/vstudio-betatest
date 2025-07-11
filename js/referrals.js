document.addEventListener('DOMContentLoaded', () => {
  const refCodeInput = document.getElementById('ref-code');
  const copyBtn = document.querySelector('.referals-copy-btn');
  const activateBtn = document.querySelector('.referals-activate-btn');
  const activateInput = document.querySelector('.referals-activate-code-input');
  const infos = {
    totalEarned: document.querySelector('.referals-card-infos .referals-info-value:nth-child(1)'),
    ratePerUser: document.querySelector('.referals-card-infos .referals-info-value:nth-child(2)'),
    invitedUsers: document.querySelector('.referals-card-infos .referals-info-value:nth-child(3)'),
  };
  const activateCard = document.querySelector('.referals-card-activate');

  // Получить данные пользователя (в том числе реферальный код)
  fetch('/api/current-user')
    .then(res => res.json())
    .then(user => {
      refCodeInput.value = user.referral_code || '';

      // Получить данные рефералов
      fetch('/api/referral/info')
        .then(res => res.json())
        .then(data => {
          infos.totalEarned.textContent = data.totalEarned || 0;
          infos.ratePerUser.textContent = data.ratePerUser || 1;
          infos.invitedUsers.textContent = data.invitedUsers || 0;

          // Если уже активировал чей-то код, скрыть форму активации
          if (data.activatedReferralCode && data.activatedReferralCode !== '') {
            activateCard.style.display = 'none';
          }
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
        if (!data.message.includes('ошибка')) {
          // Обновить данные рефералов и скрыть форму
          activateCard.style.display = 'none';
          fetch('/api/referral/info')
            .then(res => res.json())
            .then(data => {
              infos.totalEarned.textContent = data.totalEarned || 0;
              infos.ratePerUser.textContent = data.ratePerUser || 1;
              infos.invitedUsers.textContent = data.invitedUsers || 0;
            });
        }
      })
      .catch(() => alert('Ошибка сервера'));
  });
});
