document.querySelectorAll('.roadmap-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const item = toggle.closest('.roadmap-item');
    item.classList.toggle('open');
  });

  document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target); // запускается один раз
        }
      });
    }, {
      threshold: 0.2 // триггерится, когда 20% блока видно
    });

    const roadmap = document.querySelector('.roadmap-container');
    if (roadmap) {
      observer.observe(roadmap);
    }
  });
});