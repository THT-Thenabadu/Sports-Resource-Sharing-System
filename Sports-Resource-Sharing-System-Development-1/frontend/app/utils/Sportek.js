export const scrollTo = (selector) => {
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};


export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};


export const filterItems = (items = [], query = '') => {
  if (!query.trim()) return items;
  const lower = query.toLowerCase();
  return items.filter((item) =>
    Object.values(item).some(
      (val) => typeof val === 'string' && val.toLowerCase().includes(lower)
    )
  );
};


export const formatPrice = (amount, currency = 'LKR') => {
  return `${currency} ${Number(amount).toLocaleString()}`;
};


export const trapFocus = (element) => {
  const focusable = element.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
};


export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;