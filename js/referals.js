// Пример загрузки данных
async function loadReferralData() {
  const res = await fetch('/api/referral-info');
  if (res.ok) {
    const data = await res.json();

    document.querySelector('#ref-code').value = data.referral_code;

    if (data.activated_referral_code) {
      // Скрыть блок активации кода
      document.querySelector('.referals-card-activate').style.display = 'none';
    } else {
      // Показать блок
      document.querySelector('.referals-card-activate').style.display = 'block';
    }

    // Заполнение статистики
    document.querySelector('.referals-card-infos .referals-info-value:nth-child(1)').textContent = data.referral_earnings;
    document.querySelector('.referals-card-infos .referals-info-value:nth-child(2)').textContent = data.rate_per_user;
    document.querySelector('.referals-card-infos .referals-info-value:nth-child(3)').textContent = data.referrals;
  }
}

// Обработка активации
document.querySelector('.referals-activate-btn').addEventListener('click', async () => {
  const code = document.querySelector('.referals-activate-code-input').value.trim();
  if (!code) return alert('Введите реферальный код');

  const res = await fetch('/api/referral/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  const data = await res.json();
  if (res.ok) {
    alert(data.message);
    document.querySelector('.referals-card-activate').style.display = 'none';
    loadReferralData();
  } else {
    alert(data.message);
  }
});

loadReferralData();