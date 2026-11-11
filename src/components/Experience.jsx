import { useEffect, useRef } from 'react';
import { experience } from '../data/profile.js';

// Notes in [square brackets] are placeholders still to be filled in, so they're never shown
const clean = (t = '') => t.replace(/\s*\[[^\]]*\]/g, '').trim();

export default function Experience() {
  const tl = useRef(null);

  // The dashed line fills in blue as you scroll through the timeline
  useEffect(() => {
    const onScroll = () => {
      const el = tl.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.7 - r.top) / r.height));
      el.style.setProperty('--tl', p * 100 + '%');
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="exp" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="sec-head rv">
        <p className="label">Experience</p>
        <h2>The journey so far</h2>
      </div>
      <div className="tl" ref={tl}>
        {experience.map((e) => (
          <div className={`job dz spot rv${e.now ? ' now' : ''}`} key={e.title}>
            <span className="dot" aria-hidden="true" />
            {e.now && <span className="now-tag">Now</span>}
            <span className="when">{e.when}</span>
            <h3>{e.title}</h3>
            {clean(e.text) && <p>{clean(e.text)}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
