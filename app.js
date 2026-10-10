document.documentElement.classList.add('has-js');

const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
if (menu && navigation) {
  menu.hidden = false;
  const setMenu = (open) => {
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    menu.querySelector('span').textContent = open ? '−' : '+';
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    setMenu(false);
    const target = document.querySelector(link.hash);
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', () => setMenu(false));
}

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copy);
    const status = button.parentElement.querySelector('[role="status"]');
    try {
      await navigator.clipboard.writeText(source.textContent.trim());
      status.textContent = 'Citation copied.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(source);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Citation selected. Use your device’s copy command.';
    }
  });
});

const printButton = document.querySelector('.print-button');
if (printButton) {
  printButton.hidden = false;
  printButton.addEventListener('click', () => window.print());
}
