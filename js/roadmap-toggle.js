document.querySelectorAll('.roadmap-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const item = toggle.closest('.roadmap-item');
    item.classList.toggle('open');
  });
});