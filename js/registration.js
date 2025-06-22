const passwordInput = document.querySelector('input[data-placeholder="register-password"]');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.querySelector('.strength-text');
const passwordError = document.querySelector('.password-error');

const specialChars = /[!"#$%'()*]/;

// Проверка пароля
passwordInput.addEventListener('input', () => {
  const val = passwordInput.value.trim();

  if (val.length === 0) {
    strengthBar.style.width = '0%';
    strengthBar.style.backgroundColor = 'red';
    strengthText.textContent = 'Введите пароль';
    passwordError.style.display = 'none';
  } else if (val.length < 6) {
    strengthBar.style.width = '33%';
    strengthBar.style.backgroundColor = 'red';
    strengthText.textContent = 'Слишком короткий';
    passwordError.style.display = 'block';
    passwordError.textContent = 'Вы ввели менее 6 символов';
  } else if (!specialChars.test(val)) {
    strengthBar.style.width = '66%';
    strengthBar.style.backgroundColor = 'orange';
    strengthText.textContent = 'Средний пароль';
    passwordError.style.display = 'block';
    passwordError.textContent = 'Введите специальный символ (! " # $ % \' () *)';
  } else {
    strengthBar.style.width = '100%';
    strengthBar.style.backgroundColor = 'green';
    strengthText.textContent = 'Надёжный пароль';
    passwordError.style.display = 'none';
  }
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
      <h2 class="modal-message-title theme-text">${title}</h2>
      <p class="modal-message-message theme-text">${message}</p>
    </div>
  `;

  // Добавляем в DOM
  document.body.appendChild(modal);

  // Обработчик закрытия
  modal.querySelector('.modal-message-close').addEventListener('click', () => {
    modal.remove();
  });
}

// Отправка формы регистрации
document.querySelector('.registration-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.querySelector('input[data-placeholder="register-first-name"]').value.trim();
  const lastName = document.querySelector('input[data-placeholder="register-last-name"]').value.trim();
  const username = document.querySelector('input[data-placeholder="register-username"]').value.trim();
  const email = document.querySelector('input[data-placeholder="register-email"]').value.trim();
  const password = passwordInput.value.trim();

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName,
        lastName,
        username,
        email,
        password
      })
    });

    const result = await response.json();

    if (response.ok) {
      // Успех
      showModalMessage('Подтверждение регистрации', 'Вы зарегистрированы, перенаправляем...');
      setTimeout(() => {
        window.location.href = `/auth.html`;
      }, 2000);
    } else {
      // Ошибка с сервера
      showModalMessage('Ошибка регистрации', result.message || 'Произошла ошибка, попробуйте позже.');
    }

  } catch (error) {
    console.error('Ошибка:', error);
    showModalMessage('Сетевая ошибка', 'Не удалось соединиться с сервером, попробуйте позже.');
  }
});