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