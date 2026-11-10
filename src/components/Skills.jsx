import { marquee, toolGroups } from '../data/profile.js';

const ICONS = {
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />,
  cloud: <path d="M7 18a4 4 0 010-8 6 6 0 0111.6 1.5A3.5 3.5 0 0118 18z" />,
  web: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
    </>
  ),
};

function Row({ items, reverse }) {
  // Doubled so the loop is seamless
  const all = [...items, ...items];
  return (
    <div className={`mq-row${reverse ? ' rev' : ''}`} aria-hidden="true">
      {all.map((t, i) => (
        <span key={i}>{t}</span>
      ))}
    </div>
  );
}

export default function Skills() {
  const label = [...marquee.top, ...marquee.bottom].join(', ');
  return (
    <section id="skills" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div className="sec-head rv">
        <p className="label">Skills</p>
        <h2>My toolbox</h2>
      </div>
      <div className="marquee" role="img" aria-label={`Tools: ${label}`}>
        <Row items={marquee.top} />
        <Row items={marquee.bottom} reverse />
      </div>
      <div className="tools">
        {toolGroups.map((g) => (
          <div className="tool dz rv" key={g.title}>
            <div className="tool-top">
              <b>{g.title}</b>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[g.icon]}
              </svg>
            </div>
            <div className="tool-body">
              <p>{g.text}</p>
              <div className="chips">
                {g.items.map((it) => (
                  <span className="chip" key={it}>{it}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
