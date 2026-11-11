import { useEffect, useRef } from 'react';
import { experience } from '../data/profile.js';

// Notes in [square brackets] are placeholders still to be filled in, so they're never shown
const clean = (t = '') => t.replace(/\s*\[[^\]]*\]/g, '').trim();

// The role on its own; the organisation gets its own line next to its logo
const role = (e) => (e.org ? e.title.replace(` · ${e.org}`, '') : e.title);

function OrgMark({ e }) {
  if (e.logo) {
    return (
      <span className={`org-mark${e.logoFill ? ' fill' : ''}`}>
        <img src={e.logo} alt={`${e.org} logo`} width="44" height="44" loading="lazy" decoding="async" />
      </span>
    );
  }
  return (
    <span className="org-mark initials" aria-hidden="true">
      {e.initials || (e.org || e.title).slice(0, 2)}
    </span>
  );
}

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
            <div className="job-row">
              <OrgMark e={e} />
              <div className="job-body">
                {e.now && <span className="now-tag">Now</span>}
                <span className="when">{e.when}</span>
                <h3>{role(e)}</h3>
                {e.org && <span className="org">{e.org}</span>}
                {clean(e.text) && <p>{clean(e.text)}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
