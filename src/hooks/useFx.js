import { useEffect } from 'react';

// 1. Spotlight: a soft glow follows the mouse over any element with class "spot"
// 2. Konami code (↑↑↓↓←→←→BA): fires a "konami" event; cards fall and bounce back,
//    and Robo dances (Robo listens for the same event). The terminal's "konami" command fires it too.
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const FALLERS = '.sheet, .tool, .badge, .job, .contact-card, .stat-cell, .hero-meta span, .chip, .avatar-card, .cert-list';

export function triggerKonami() {
  window.dispatchEvent(new Event('konami'));
}

export function useFx() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Spotlight
    let spotRaf = 0;
    const onMove = (e) => {
      if (spotRaf) return;
      spotRaf = requestAnimationFrame(() => {
        spotRaf = 0;
        const el = e.target instanceof Element ? e.target.closest('.spot') : null;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    if (fine && !reduce) addEventListener('pointermove', onMove, { passive: true });

    // Konami
    let pos = 0;
    const onKey = (e) => {
      // Autofill sends keydown events with no key; typing in a form shouldn't count either
      if (typeof e.key !== 'string') return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
        pos = 0;
        return;
      }
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === KONAMI[pos] ? pos + 1 : k === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        triggerKonami();
      }
    };
    const onKonami = () => {
      if (reduce) return;
      const els = [...document.querySelectorAll(FALLERS)].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight && !el.closest('.fall');
      });
      els.forEach((el) => {
        el.style.setProperty('--gx', `${Math.round(Math.random() * 140 - 70)}px`);
        el.style.setProperty('--gr', `${Math.round(Math.random() * 70 - 35)}deg`);
        el.style.setProperty('--gd', `${(Math.random() * 0.25).toFixed(2)}s`);
        el.classList.add('fall');
      });
      setTimeout(() => els.forEach((el) => el.classList.remove('fall')), 2900);
    };
    addEventListener('keydown', onKey);
    addEventListener('konami', onKonami);

    return () => {
      removeEventListener('pointermove', onMove);
      removeEventListener('keydown', onKey);
      removeEventListener('konami', onKonami);
      cancelAnimationFrame(spotRaf);
    };
  }, []);
}
