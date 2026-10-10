document.documentElement.classList.add('has-js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const artwork = document.querySelector('[data-artwork]');
const motionButton = document.querySelector('.motion-toggle');
let pausedByUser = false;
let artworkVisible = true;
const resetParallax = () => {
  artwork?.style.setProperty('--art-x', '0px');
  artwork?.style.setProperty('--art-y', '0px');
};
const refreshMotion = () => {
  const paused = reducedMotion.matches || pausedByUser;
  document.documentElement.dataset.motion = paused ? 'paused' : 'running';
  if (motionButton) {
    motionButton.hidden = false;
    motionButton.disabled = reducedMotion.matches;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.querySelector('.motion-label').textContent = reducedMotion.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
    motionButton.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
  }
  if (paused) resetParallax();
};
refreshMotion();
reducedMotion.addEventListener('change', refreshMotion);
motionButton?.addEventListener('click', () => { pausedByUser = !pausedByUser; refreshMotion(); });

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -18px 0px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
  document.documentElement.classList.add('motion-ready');
  if (artwork) new IntersectionObserver(([entry]) => {
    artworkVisible = entry.isIntersecting;
    artwork.dataset.running = String(artworkVisible && !document.hidden);
  }, { threshold: 0.05 }).observe(artwork);
}
document.addEventListener('visibilitychange', () => {
  if (artwork) artwork.dataset.running = String(artworkVisible && !document.hidden);
});

const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
if (menu && navigation) {
  menu.hidden = false;
  const setMenu = (open) => {
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    setMenu(false);
    const target = document.querySelector(link.hash);
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false); menu.focus();
    }
  });
  window.matchMedia('(min-width: 651px)').addEventListener('change', () => setMenu(false));
}

const header = document.querySelector('.site-header');
const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const tablist = document.querySelector('.figure-tabs');
if (tablist) {
  tablist.hidden = false;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const selectView = (tab) => {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    }
    document.querySelectorAll('.art-view').forEach((view) => view.classList.toggle('is-active', view.dataset.art === tab.dataset.view));
    artwork.dataset.view = tab.dataset.view;
  };
  for (const tab of tabs) {
    tab.addEventListener('click', () => selectView(tab));
    tab.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(tab);
      const destinations = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      const next = tabs[destinations[event.key]];
      selectView(next); next.focus();
    });
  }
}

if (artwork) {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  artwork.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches || pausedByUser) return;
    const box = artwork.getBoundingClientRect();
    artwork.style.setProperty('--art-x', `${((event.clientX - box.left) / box.width - 0.5) * 12}px`);
    artwork.style.setProperty('--art-y', `${((event.clientY - box.top) / box.height - 0.5) * 8}px`);
  });
  artwork.addEventListener('pointerleave', resetParallax);
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
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Citation selected. Use your device’s copy command.';
    }
  });
});
const printButton = document.querySelector('.print-button');
if (printButton) { printButton.hidden = false; printButton.addEventListener('click', () => window.print()); }
