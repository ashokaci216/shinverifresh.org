(function () {
  const welcomeScreen = document.getElementById('welcome-screen');
  const orbitEl = document.getElementById('welcome-orbit');

  if (!welcomeScreen || !orbitEl) return;

  const welcomeCategories = [
    { id: 'skylark-frozen', name: 'Skylark Frozen' },
    { id: 'wingreen-mayo', name: 'Wingreen Mayo' },
    { id: 'basa-prawns', name: 'Basa & Prawns' },
    { id: 'frozen-foods', name: 'Frozen Foods' },
    { id: 'olives-pasta', name: 'Olives & Pasta' },
    { id: 'imported-cheese', name: 'Imported Cheese' },
    { id: 'dairy-cheese', name: 'Dairy & Cheese' },
    { id: 'chinese-sauces', name: 'Chinese Sauces' },
    { id: 'sushi-products', name: 'Sushi Products' },
    { id: 'hyfun-fries', name: 'Hyfun Fries' }
  ];

  let isClosing = false;
  let resizeTimer = null;

  function renderOrbit() {
    orbitEl.innerHTML = '';

    const rect = orbitEl.getBoundingClientRect();
    const total = welcomeCategories.length;
    const scale = Math.min(1.05, 0.92 + total * 0.01);
    const radiusX = rect.width * 0.40 * scale;
    const radiusY = rect.height * 0.40 * scale;
    const step = 360 / total;
    const startAngle = -72;

    welcomeCategories.forEach((category, index) => {
      const angle = (Math.PI / 180) * (startAngle + step * index);
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      const pill = document.createElement('span');

      pill.className = 'welcome-screen__pill';
      pill.dataset.id = category.id;
      pill.textContent = category.name;
      pill.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) translate(var(--welcome-nudge-x), var(--welcome-nudge-y))`;

      orbitEl.appendChild(pill);
    });
  }

  function closeWelcomeScreen() {
    if (isClosing) return;

    isClosing = true;
    welcomeScreen.classList.add('is-closing');
    document.body.classList.remove('welcome-screen-open');
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    window.setTimeout(() => {
      welcomeScreen.remove();
    }, 280);
  }

  document.body.classList.add('welcome-screen-open');
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  renderOrbit();
  welcomeScreen.focus({ preventScroll: true });

  welcomeScreen.addEventListener('click', closeWelcomeScreen);
  welcomeScreen.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      closeWelcomeScreen();
    }
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderOrbit, 100);
  });
})();
