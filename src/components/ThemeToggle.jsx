import { useState } from 'react';

const getTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

// Light is the default. The choice is remembered in this browser only.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme);
  const dark = theme === 'dark';

  const toggle = (e) => {
    const next = dark ? 'light' : 'dark';
    const apply = () => {
      if (next === 'dark') document.documentElement.dataset.theme = 'dark';
      else delete document.documentElement.dataset.theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#121311' : '#ECECE7');
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage blocked: the choice just won't be remembered */
      }
      setTheme(next);
    };

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      apply();
      return;
    }
    // Grow the new theme out of the button as a circle
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2;
    const y = e.clientY || r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = document.startViewTransition(apply);
    t.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
      })
      .catch(() => {});
  };

  return (
    <button
      className="theme-btn"
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
