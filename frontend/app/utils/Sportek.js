// ===========================
// sportek.js — Shared utilities & interactions
// ===========================

/**
 * Smooth scroll to a target element by selector or id
 * Usage: scrollTo('#hero')
 */
export const scrollTo = (selector) => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  /**
   * Debounce helper — throttles fast-firing events like resize/scroll
   * Usage: window.addEventListener('resize', debounce(myFn, 200))
   */
  export const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };
  
  /**
   * Simple in-memory search filter
   * Pass an array of items and a query string; returns matching items
   * by checking all string values of each object.
   *
   * Usage:
   *   const results = filterItems(facilities, 'tennis');
   */
  export const filterItems = (items = [], query = '') => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter((item) =>
      Object.values(item).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(lower)
      )
    );
  };
  
  /**
   * Format a price number as currency string
   * Usage: formatPrice(4500) => "LKR 4,500"
   */
  export const formatPrice = (amount, currency = 'LKR') => {
    return `${currency} ${Number(amount).toLocaleString()}`;
  };
  
  /**
   * Trap focus inside a modal/dialog for accessibility
   * Usage: trapFocus(document.querySelector('.modal'))
   */
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
  
  /**
   * Detect if the user prefers reduced motion
   * Usage: if (!prefersReducedMotion()) { runAnimation(); }
   */
  export const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;