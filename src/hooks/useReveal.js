import { useEffect } from 'react';

// Fades in .rv elements that start below the fold. Anything already on screen
// stays visible, so the page is complete before any scrolling.
export function useReveal() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = [...document.querySelectorAll('.rv')];
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          el.classList.remove('pend');
          el.classList.add('in');
          io.unobserve(el);
          setTimeout(() => (el.style.transitionDelay = ''), 1400);
        }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight) {
        const siblings = [...el.parentElement.children];
        if (el.parentElement.classList.contains('tools') || el.classList.contains('job') || el.classList.contains('badge')) {
          el.style.transitionDelay = siblings.indexOf(el) * 0.1 + 's';
        }
        el.classList.add('pend');
        io.observe(el);
      } else {
        el.classList.add('in');
      }
    });
    const safety = setTimeout(() => {
      document.querySelectorAll('.rv.pend').forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight) {
          el.classList.remove('pend');
          el.classList.add('in');
        }
      });
    }, 2500);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);
}
