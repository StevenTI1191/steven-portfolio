import { useCallback, useEffect, useRef } from 'react';
import { projects } from '../data/profile.js';
import Button from './Button.jsx';

function ProjectCard({ p, cardRef }) {
  const links = [p.github && { href: p.github, label: 'GitHub ↗' }, p.demo && { href: p.demo, label: 'Live demo ↗' }].filter(Boolean);

  return (
    <article ref={cardRef} className={`sheet dz spot k${p.color.slice(1)}`}>
      <div className="sheet-head">
        <span className="tag">{p.tag}</span>
        <span className="meta">{p.meta}</span>
      </div>
      <div className="ttl">
        <h3>{p.title}</h3>
        <p>{p.summary}</p>
      </div>
      <ul className="checks">
        {p.points.map((pt) => (
          <li key={pt}>{pt}</li>
        ))}
      </ul>
      {p.stat && (
        <div className="stat">
          <b>{p.stat.value}</b>
          <span>{p.stat.label}</span>
        </div>
      )}
      {p.stack && (
        <div className="chips">
          {p.stack.map((s) => (
            <span className="chip" key={s}>{s}</span>
          ))}
        </div>
      )}
      {links.length > 0 && (
        <div className="acts">
          {links.map((l, i) => (
            <Button key={l.href} small primary={i === 0} href={l.href}>
              {l.label}
            </Button>
          ))}
        </div>
      )}
    </article>
  );
}

export default function Projects() {
  const cards = useRef([]);

  // Each card sticks a little lower than the one before, so the edges peek out like a stack.
  // A card taller than the screen sticks only once its bottom is visible, so it can be read fully.
  const layout = useCallback(() => {
    cards.current.forEach((c, i) => {
      if (!c) return;
      c.classList.remove('stick');
      c.style.top = '';
      const top = Math.min(80 + i * 14, innerHeight - c.offsetHeight - 16);
      c.classList.add('stick');
      c.style.top = top + 'px';
    });
  }, []);

  useEffect(() => {
    layout();
    // Card heights change once the web fonts load, so measure again then
    let live = true;
    document.fonts?.ready.then(() => live && layout());
    addEventListener('resize', layout);
    return () => {
      live = false;
      removeEventListener('resize', layout);
    };
  }, [layout]);

  return (
    <section id="work" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="sec-head rv">
        <p className="label">Selected projects</p>
        <h2>Things I've built</h2>
      </div>
      <div className="stack">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} p={p} cardRef={(el) => (cards.current[i] = el)} />
        ))}
      </div>
    </section>
  );
}
