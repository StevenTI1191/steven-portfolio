import { useCallback, useEffect, useRef, useState } from 'react';
import { badges, badgeFilters } from '../data/profile.js';
import Button from './Button.jsx';

// "Issuer · Year", skipping any value still left as a [placeholder]
function metaLine(b) {
  return [b.issuer, b.year].filter((v) => v && !v.startsWith('[')).join(' · ');
}

function BadgeArt({ b }) {
  if (b.image) return <img src={b.image} alt="" loading="lazy" decoding="async" />;
  const ring = { fill: 'none', stroke: '#fff', strokeOpacity: 0.5, strokeWidth: 2 };
  const label = (
    <text x="50" y="57" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize={b.short.length > 3 ? 18 : 22} fill="#fff">
      {b.short}
    </text>
  );
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      {b.shape === 'hex' && (
        <>
          <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill={b.color} />
          <polygon points="50,14 83,32 83,68 50,86 17,68 17,32" {...ring} />
        </>
      )}
      {b.shape === 'circle' && (
        <>
          <circle cx="50" cy="50" r="46" fill={b.color} />
          <circle cx="50" cy="50" r="36" {...ring} strokeDasharray="4 4" />
        </>
      )}
      {b.shape === 'shield' && (
        <>
          <path d="M50 4 L90 18 V52 C90 74 72 90 50 96 C28 90 10 74 10 52 V18 Z" fill={b.color} />
          <path d="M50 14 L80 25 V52 C80 69 67 81 50 86 C33 81 20 69 20 52 V25 Z" {...ring} />
        </>
      )}
      {b.shape === 'diamond' && (
        <>
          <rect x="10" y="10" width="80" height="80" rx="18" transform="rotate(45 50 50)" fill={b.color} />
          <rect x="22" y="22" width="56" height="56" rx="12" transform="rotate(45 50 50)" {...ring} />
        </>
      )}
      {label}
    </svg>
  );
}

function Lightbox({ badge, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="lbTitle" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lb-card dz">
        <div className="lb-img">
          <BadgeArt b={badge} />
        </div>
        <h3 id="lbTitle">{badge.name}</h3>
        <p>{metaLine(badge)}</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          {badge.link && (
            <Button primary small href={badge.link}>
              View credential ↗
            </Button>
          )}
          <button ref={closeRef} className="btn sm" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Badges() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const lastRef = useRef(null);
  // Highlights: only certifications that have a badge image
  const featured = badges.filter((b) => b.image);
  // Full list: every certification, filtered by the tabs
  const shown = badges.filter((b) => filter === 'all' || b.category === filter);
  const kindLabel = (b) => badgeFilters.find((f) => f.id === b.category)?.label || b.category;

  // Stable function, so the open lightbox doesn't re-grab focus on every re-render
  const close = useCallback(() => {
    setSelected(null);
    lastRef.current?.focus();
  }, []);

  return (
    <section id="cert" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="cert-head rv">
        <div className="sec-head">
          <p className="label">Certifications</p>
          <h2>Licenses &amp; certifications</h2>
        </div>
        <span className="count">
          {badges.length} {badges.length === 1 ? 'certification' : 'certifications'}
        </span>
      </div>

      {featured.length > 0 && <p className="label rv">Highlights</p>}
      {featured.length > 0 && <div className="shelf">
        {featured.map((b, i) => (
          <button
            key={b.name}
            className="badge dz spot rv"
            style={{ animationDelay: `${i * 0.06}s` }}
            type="button"
            onClick={(e) => {
              lastRef.current = e.currentTarget;
              setSelected(b);
            }}
          >
            <span className="stage">
              <BadgeArt b={b} />
            </span>
            <span className="bmeta">
              <span className="bkind">{kindLabel(b)}</span>
              <b>{b.name}</b>
              <span>{metaLine(b)}</span>
            </span>
          </button>
        ))}
      </div>}

      <div className="cert-list dz rv">
        <div className="cert-list-head">
          <p className="label">All certifications</p>
          <div className="tabs" role="group" aria-label="Filter certifications">
            {badgeFilters.map((f) => (
              <button key={f.id} className="tab" type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {shown.length === 0 ? (
          <p className="cert-empty">No certifications in this category yet.</p>
        ) : (
          <ul>
            {shown.map((b, i) => {
              const body = (
                <>
                  {b.image || b.logo ? (
                    <img className={`cert-thumb${b.image ? '' : ' is-logo'}`} src={b.image || b.logo} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="cert-dot" aria-hidden="true">{b.short}</span>
                  )}
                  <span className="cert-txt">
                    <b>{b.name}</b>
                    <span>{metaLine(b)}</span>
                  </span>
                  <span className="cert-kind">{kindLabel(b)}</span>
                  {b.link && <span className="cert-go" aria-hidden="true">↗</span>}
                </>
              );
              return (
                <li key={b.name + filter} className="pop-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  {b.link ? (
                    <a className="cert-row" href={b.link} target="_blank" rel="noopener">{body}</a>
                  ) : (
                    <div className="cert-row">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {selected && <Lightbox badge={selected} onClose={close} />}
    </section>
  );
}
