import { useCallback, useEffect, useRef, useState } from 'react';
import { projects } from '../data/profile.js';
import Button from './Button.jsx';
import Mockup from './Mockup.jsx';

function ProjectCard({ p, open, onToggle, cardRef }) {
  return (
    <article ref={cardRef} className={`sheet dz k${p.color.slice(1)}`}>
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
      <div className="stat">
        <b>{p.stat.value}</b>
        <span>{p.stat.label}</span>
      </div>
      <div className="acts">
        <Button primary small aria-expanded={open} onClick={onToggle}>
          {open ? 'Hide details ↑' : 'View details ↓'}
        </Button>
        <Button small href={p.github}>
          GitHub ↗
        </Button>
      </div>
      {open && (
        <div className="more-body">
          <Mockup kind={p.mock} screenshot={p.screenshot} title={p.title} />
          <div className="panels">
            <div className="panel">
              <p className="label">Problem</p>
              <p>{p.problem}</p>
            </div>
            <div className="panel mech">
              <p className="label">{p.mechanismLabel}</p>
              <p>{p.mechanism}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function Projects() {
  const [openId, setOpenId] = useState(null);
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
    addEventListener('resize', layout);
    return () => removeEventListener('resize', layout);
  }, [layout]);

  useEffect(() => {
    layout();
  }, [openId, layout]);

  return (
    <section id="work" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="sec-head rv">
        <p className="label">Selected projects</p>
        <h2>Things I've built</h2>
      </div>
      <div className="stack">
        {projects.map((p, i) => (
          <ProjectCard
            key={p.id}
            p={p}
            open={openId === p.id}
            onToggle={() => setOpenId((cur) => (cur === p.id ? null : p.id))}
            cardRef={(el) => (cards.current[i] = el)}
          />
        ))}
      </div>
    </section>
  );
}
