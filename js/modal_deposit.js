document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.querySelector('.deposit_wallet');
  const modal = document.getElementById('depositModal');
  const closeBtn = modal.querySelector('.close-btn');
  const switches = modal.querySelectorAll('.switch');
  const bodies = modal.querySelectorAll('.modal-body');
  const promoInput = document.getElementById('promoInput');
  const activateBtn = document.getElementById('activatePromo');

  openBtn.addEventListener('click', () => modal.classList.add('show'));
  closeBtn.addEventListener('click', () => modal.classList.remove('show'));

  switches.forEach(sw => {
    sw.addEventListener('click', () => {
      switches.forEach(btn => btn.classList.remove('active'));
      sw.classList.add('active');

      bodies.forEach(body => {
        body.classList.add('hidden');
      });

      document.getElementById(sw.dataset.target).classList.remove('hidden');
    });
  });

  promoInput.addEventListener('input', () => {
    const val = promoInput.value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    let formatted = val.match(/.{1,4}/g)?.join('-') ?? '';
    promoInput.value = formatted.slice(0, 19);

    if (formatted.length === 19) {
      activateBtn.classList.add('active');
      activateBtn.disabled = false;
    } else {
      activateBtn.classList.remove('active');
      activateBtn.disabled = true;
    }
  });

  activateBtn.addEventListener('click', async () => {
    const code = promoInput.value;
    if (!code || code.length !== 19) return;

    try {
      const res = await fetch('/api/promo/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const result = await res.json();

      if (result.success) {
        alert(result.message);
        promoInput.value = '';
        activateBtn.classList.remove('active');

        // Получаем текущего пользователя и обновляем баланс на странице
        const user = await fetch('/api/current-user').then(res => res.json());
        document.getElementById('balanceAmount').textContent = `${user.balance}`;
      } else {
        alert(`Ошибка: ${result.message}`);
      }
    } catch (err) {
      alert('Произошла ошибка при активации промокода.');
    }
  });
});