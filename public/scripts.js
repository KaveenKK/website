document.addEventListener('DOMContentLoaded', () => {
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const menu = document.getElementById('menu');

  hamburgerMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !hamburgerMenu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menu.style.display = 'flex';
    } else {
      menu.style.display = 'none';
    }
  });

  // Initial state based on screen size
  if (window.innerWidth > 768) {
    menu.style.display = 'flex';
  } else {
    menu.style.display = 'none';
  }
});