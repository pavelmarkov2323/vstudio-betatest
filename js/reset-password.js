document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.reset-form');
  const passwordInput = container.querySelector('#new-password');
  const confirmInput = container.querySelector('#confirm-password');
  const strengthBar = container.querySelector('.strength-bar');
  const strengthText = container.querySelector('.strength-text');
  const passwordError = container.querySelector('.password-error');
  const resetBtn = container.querySelector('#reset-btn');

  const specialChars = /[!"#$%'()*]/;

  function validatePassword() {
    const val = passwordInput.value.trim();

    if (val.length === 0) {
      strengthBar.style.width = '0%';
      strengthBar.style.backgroundColor = 'red';
      strengthText.textContent = 'Enter the password';
      passwordError.style.display = 'none';
    } else if (val.length < 6) {
      strengthBar.style.width = '33%';
      strengthBar.style.backgroundColor = 'red';
      strengthText.textContent = 'Too short';
      passwordError.style.display = 'block';
      passwordError.textContent = window.resetPasswordTranslations.tooShort;
    } else if (!specialChars.test(val)) {
      strengthBar.style.width = '66%';
      strengthBar.style.backgroundColor = 'orange';
      strengthText.textContent = 'The average password';
      passwordError.style.display = 'block';
      passwordError.textContent = window.resetPasswordTranslations.noSpecialChar;
    } else {
      strengthBar.style.width = '100%';
      strengthBar.style.backgroundColor = 'green';
      strengthText.textContent = 'Strong password';
      passwordError.style.display = 'none';
    }
  }

  function checkFormValidity() {
    const password = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();
    const isStrong = strengthBar.style.width === '100%';
    const match = password === confirm && password.length > 0;

    resetBtn.disabled = !(isStrong && match);
  }

  passwordInput.addEventListener('input', () => {
    validatePassword();
    checkFormValidity();
  });

  confirmInput.addEventListener('input', checkFormValidity);

  // 👁️‍🗨️ Добавляем обработку клика по иконке "глаз"
  const toggleIcon = container.querySelector('.toggle-visibility');
  if (toggleIcon) {
    toggleIcon.addEventListener('click', () => {
      const isVisible = passwordInput.type === 'text';
      passwordInput.type = isVisible ? 'password' : 'text';
      toggleIcon.src = isVisible
        ? 'assets/icons/eye-crossed.svg'
        : 'assets/icons/eye.svg';
    });
  }

  const resetContainer = document.querySelector('.reset-container');

  document.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 10;  // -5px to +5px
    const y = (e.clientY / innerHeight - 0.5) * 10;

    resetContainer.style.transform = `translate(${x}px, ${y}px)`;
  });

  document.addEventListener('mouseleave', () => {
    resetContainer.style.transform = 'translate(0, 0)';
  });

  // Модальное окно сообщений
  function showModalMessage(title, message) {
    // Удалим предыдущую модалку, если она есть
    const oldModal = document.querySelector('.modal-message-overlay');
    if (oldModal) oldModal.remove();

    // Создаем HTML модалки
    const modal = document.createElement('div');
    modal.className = 'modal-message-overlay';
    modal.innerHTML = `
    <div class="modal-message-window">
      <button class="modal-message-close">&times;</button>
      <h2 class="modal-message-title">${title}</h2>
      <p class="modal-message-message">${message}</p>
    </div>
  `;

    // Добавляем в DOM
    document.body.appendChild(modal);

    // Обработчик закрытия
    modal.querySelector('.modal-message-close').addEventListener('click', () => {
      modal.remove();
    });
  }
  
  // Подтверждение регистрации по кнопке
  container.addEventListener('submit', async (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      showModalMessage('Ошибка', 'Токен отсутствует или недействителен');
      return;
    }

    const password = passwordInput.value.trim();

    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: password })
    });

    const data = await res.json();

    if (res.ok) {
      showModalMessage('Успешно', data.message);
      setTimeout(() => {
        window.location.href = 'auth.html';
      }, 2000);
    } else {
      showModalMessage('Ошибка смены пароля', data.message || 'Что-то пошло не так, попробуйте позже.');
    }
  });
});