import { useEffect, useRef, useState } from 'react';
import { stats } from '../data/profile.js';

// Numbers count up from 0 the first time the strip scrolls into view
function Count({ n, run }) {
  const [v, setV] = useState(run ? 0 : n);
  useEffect(() => {
    if (!run) return;
    let raf;
    const t0 = performance.now();
    const dur = 1300;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [n, run]);
  return v;
}

export default function Stats() {
  const ref = useRef(null);
  const [state, setState] = useState('idle'); // idle → counting
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState('counting');
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section className="stats dz" ref={ref} aria-label="Quick facts">
      {stats.map((s) => (
        <div className="stat-cell spot" key={s.label}>
          <b>
            {state === 'counting' ? <Count n={s.n} run /> : s.n}
            {s.suffix || ''}
          </b>
          <span>{s.label}</span>
        </div>
      ))}
    </section>
  );
}
