document.addEventListener("DOMContentLoaded", () => {

  // Profile animation system
  const profileContainer = document.querySelector('.profile-container');

  // Bio / Text System
  const maxLength = 500;
  const editBtn = document.querySelector('.bio-edit-icon');
  const saveBtn = document.querySelector('.bio-save-icon');
  const bioText = document.querySelector('.bio-text');
  const bioInput = document.querySelector('.bio-input');
  const bioHint = document.querySelector('.bio-hint');
  const charCount = document.querySelector('.bio-char-count');

  // Avatar System
  const avatarInput = document.getElementById('avatar-upload');
  const avatarImage = document.querySelector('.profile-avatar');
  const editAvatarIcon = document.querySelector('.edit-avatar');

  // Плавная анимация появления профиля
  if (profileContainer) {
    // Немного задержки для плавности (можно убрать)
    setTimeout(() => {
      profileContainer.classList.add('visible');
    }, 100);
  }

  // Edit biography
  editBtn.addEventListener('click', () => {
    const textOnly = bioText.childNodes[0].textContent.trim();
    bioInput.value = textOnly;
    charCount.textContent = `${textOnly.length}/${maxLength}`;

    bioInput.style.display = 'block';
    bioHint.style.display = 'block';
    charCount.style.display = 'block';

    bioText.style.display = 'none';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'block';
  });

  saveBtn.addEventListener('click', () => {
    const newText = bioInput.value.trim();
    if (newText.length <= maxLength) {
      bioText.childNodes[0].textContent = newText;
      bioInput.style.display = 'none';
      bioText.style.display = 'inline';
      editBtn.style.display = 'inline';
      saveBtn.style.display = 'none';
      bioHint.style.display = 'none';
      charCount.style.display = 'none';
    }
  });

  bioInput.addEventListener('input', () => {
    const len = bioInput.value.length;
    if (len > maxLength) {
      bioInput.value = bioInput.value.slice(0, maxLength);
    }
    charCount.textContent = `${bioInput.value.length}/${maxLength}`;
  });

  // Edit avatar
  editAvatarIcon.addEventListener('click', () => {
    avatarInput.click();
  });

  avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      avatarImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.addEventListener('DOMContentLoaded', async () => {
    // Извлечём username из URL
    const pathParts = window.location.pathname.split('/');
    const username = pathParts[pathParts.length - 1];

    try {
      const res = await fetch(`/api/profile/${username}`);
      if (!res.ok) throw new Error('Пользователь не найден');
      const user = await res.json();

      // Вставляем данные в элементы страницы
      document.querySelector('.profile-heading').textContent = `Welcome, ${user.username}`;
      document.querySelector('.user-fullname').textContent = `${user.firstName} ${user.lastName}`;
      document.querySelector('.label-id').textContent = `ID: ${user.userId}`;
      document.querySelector('.label-username').textContent = `Username: ${user.username}`;

    } catch (err) {
      console.error(err);
      // Можно показать сообщение или редиректить
      document.body.innerHTML = '<h2>User not found</h2>';
    }
  });
});