document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.querySelector('.deposit_wallet');
  const modal = document.getElementById('depositModal');
  const closeBtn = modal.querySelector('.close-btn');
  const switches = modal.querySelectorAll('.switch');
  const switchIndicator = modal.querySelector('.switch-indicator');
  const bodies = modal.querySelectorAll('.modal-body');
  const promoInput = document.getElementById('promoInput');
  const activateBtn = document.getElementById('activatePromo');

  openBtn.addEventListener('click', () => modal.classList.add('show'));
  closeBtn.addEventListener('click', () => modal.classList.remove('show'));

  switches.forEach((sw, index) => {
    sw.addEventListener('click', () => {
      switches.forEach(btn => btn.classList.remove('active'));
      sw.classList.add('active');

      bodies.forEach(body => {
        body.classList.add('hidden');
      });

      document.getElementById(sw.dataset.target).classList.remove('hidden');

      switchIndicator.style.transform = `translateX(${index * 100}%)`;
    });
  });

  function showPromoMessage(type, title, message) {
    const container = document.getElementById('promoMessageContainer');
    container.innerHTML = ''; // очищаем предыдущее

    const box = document.createElement('div');
    box.className = `promo-message ${type}`;

    const strong = document.createElement('strong');
    strong.textContent = title;
    box.appendChild(strong);

    if (message) {
      const p = document.createElement('p');
      p.textContent = message;
      box.appendChild(p);
    }

    container.appendChild(box);

    // Убираем сообщение через 5 сек
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }


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
        showPromoMessage('success', 'Промокод активирован', result.message);
        promoInput.value = '';
        activateBtn.classList.remove('active');

        // Получаем текущего пользователя и обновляем баланс на странице
        const user = await fetch('/api/current-user').then(res => res.json());
        document.getElementById('balanceAmount').textContent = `${user.balance}`;
      } else {
        showPromoMessage('error', 'Ошибка', result.message);
      }
    } catch (err) {
      showPromoMessage('error', 'Ошибка', 'Произошла ошибка при активации промокода.');
    }
  });
});