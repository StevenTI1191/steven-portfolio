import { marquee, toolGroups } from '../data/profile.js';
import SkillSphere from './SkillSphere.jsx';

const ICONS = {
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />,
  cloud: <path d="M7 18a4 4 0 010-8 6 6 0 0111.6 1.5A3.5 3.5 0 0118 18z" />,
  web: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
    </>
  ),
  network: (
    <>
      <rect x="9" y="3" width="6" height="5" rx="1" />
      <rect x="3" y="16" width="6" height="5" rx="1" />
      <rect x="15" y="16" width="6" height="5" rx="1" />
      <path d="M12 8v4M6 16v-4h12v4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </>
  ),
};

// Every technical skill once, for the sphere (spoken languages stay in their own card)
const SPHERE_ITEMS = [
  ...new Set([
    ...marquee.top,
    ...marquee.bottom,
    ...toolGroups.filter((g) => g.icon !== 'globe').flatMap((g) => g.items),
  ]),
];

export default function Skills() {
  return (
    <section id="skills" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div className="sec-head rv">
        <p className="label">Skills</p>
        <h2>My toolbox</h2>
      </div>
      <SkillSphere items={SPHERE_ITEMS} />
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
