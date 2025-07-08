function openPremiumModal() {
  const modal = document.querySelector('.modal-premium-subscribe-backdrop');
  if (!modal) return;

  modal.classList.remove('hide');
  modal.classList.add('show');
}

function closePremiumModal() {
  const modal = document.querySelector('.modal-premium-subscribe-backdrop');
  if (!modal) return;

  modal.classList.remove('show');
  modal.classList.add('hide');
}

// Обработчик кнопки закрытия
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('.modal-premium-subscribe-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePremiumModal);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const selects = document.querySelectorAll('.modal-premium-subscribe-select');

  selects.forEach(select => {
    const wrapper = select.closest('.modal-premium-subscribe-select-wrapper');
    const icon = wrapper.querySelector('.modal-premium-subscribe-icon');

    // Safari и большинство браузеров не имеют события открытия <select>, но можно обойти это:
    select.addEventListener('focus', () => {
      select.classList.add('open');
      icon.classList.add('rotated');
    });

    select.addEventListener('blur', () => {
      select.classList.remove('open');
      icon.classList.remove('rotated');
    });
  });
});

const plans = {
  '1m': { label: '1 месяц (Basic)', price: 80 },
  '3m': { label: '3 месяца (Standard)', price: 240 },
  '6m': { label: '6 месяцев (Pro)', price: 480 },
  '12m': { label: '12 месяцев (Ultimate)', price: 960 }
};

const programs = {
  pixelfps: 'PixelFPS',
  superfast: 'SuperFast',
  // Можно добавить свои варианты программ
};

document.addEventListener('DOMContentLoaded', () => {
  const programSelect = document.getElementById('programSelect');
  const planSelect = document.getElementById('planSelect');
  const priceValue = document.getElementById('priceValue');
  const buyButton = document.getElementById('buyButton');

  // Заполнение программ
  Object.entries(programs).forEach(([key, label]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = label;
    programSelect.appendChild(opt);
  });

  // Заполнение тарифных планов
  Object.entries(plans).forEach(([key, { label }]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = label;
    planSelect.appendChild(opt);
  });

  function updatePriceAndButton() {
    const selectedProgram = programSelect.value;
    const selectedPlan = planSelect.value;

    if (selectedProgram && selectedPlan) {
      priceValue.textContent = plans[selectedPlan].price;
      buyButton.disabled = false;
    } else {
      priceValue.textContent = '0';
      buyButton.disabled = true;
    }
  }

  programSelect.addEventListener('change', updatePriceAndButton);
  planSelect.addEventListener('change', updatePriceAndButton);

  // Инициализация начального состояния
  updatePriceAndButton();

  // Кнопка покупки
  buyButton.addEventListener('click', async () => {
    const program = programSelect.value;
    const plan = planSelect.value;
    const price = plans[plan].price;

    try {
      const response = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program, plan, price })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Подписка успешно оформлена!');
        closePremiumModal();
      } else {
        alert('Ошибка покупки: ' + result.message);
      }
    } catch (err) {
      alert('Ошибка сети или сервера');
      console.error(err);
    }
  });
});