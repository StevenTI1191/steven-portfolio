import { useEffect, useRef, useState } from 'react';
import { profile, avatarRing, badges } from '../data/profile.js';

// Ring text is set in JetBrains Mono, where every character is 0.6em wide,
// so panel widths can be computed exactly and the band closes into a full circle.
const CHAR_EM = 0.6;
const SEP_EM = 1.7; // the ✦ slot
const PAD_EM = 0.6;
const RING_RADIUS = 0.36; // × figure width (head is ~0.49 wide)

// Fixed spark positions so the layout doesn't jump between renders
const SPARKS = [
  [8, 30, 0], [16, 62, 1.4], [24, 18, 2.6], [78, 22, 0.8], [86, 48, 2.1], [92, 70, 3.3],
  [12, 82, 3.8], [70, 10, 1.1], [30, 44, 4.2], [64, 38, 2.9], [50, 6, 0.4], [40, 74, 1.8],
];

// One narrow panel per character, so the band bends smoothly around the head
function Ring({ side, geo }) {
  return (
    <div className={`ring ring-${side}`} style={{ '--fs': `${geo.fs}px` }} aria-hidden="true">
      <div className="ring-tilt">
        <div className="ring-spin">
          {geo.panels.map((p, i) => (
            <span
              key={i}
              className={`ring-panel${p.sep ? ' ring-sep' : ''}`}
              style={{ width: p.w + 1, marginLeft: -(p.w + 1) / 2, transform: `rotateY(${p.angle}deg) translateZ(${geo.R}px)` }}
            >
              {p.c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AvatarCard() {
  const cardRef = useRef(null);
  const figRef = useRef(null);
  const [geo, setGeo] = useState(null);
  // The first two certifications with a badge image float beside the card
  const floating = badges.filter((b) => b.image).slice(0, 2);

  // Size the ring from the figure width, so it fits the head at every screen size
  useEffect(() => {
    const fig = figRef.current;
    const compute = () => {
      const W = fig.getBoundingClientRect().width;
      if (!W) return;
      const R = W * RING_RADIUS;
      // Flatten the words into characters plus one ✦ slot after each word
      const cells = avatarRing.flatMap((word) => [
        ...[...word].map((c) => ({ c: c === ' ' ? ' ' : c, em: CHAR_EM })),
        { c: '✦', em: SEP_EM + PAD_EM, sep: true },
      ]);
      const fs = (2 * Math.PI * R) / cells.reduce((a, x) => a + x.em, 0);
      let acc = 0;
      const panels = cells.map((x) => {
        const w = x.em * fs;
        const angle = ((acc + w / 2) / R) * (180 / Math.PI);
        acc += w;
        return { ...x, w, angle };
      });
      setGeo({ R, fs, panels });
    };
    compute();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(compute) : null;
    ro?.observe(fig);
    return () => ro?.disconnect();
  }, []);

  // Gentle 3D tilt toward the mouse (desktop only)
  useEffect(() => {
    const card = cardRef.current;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    const move = (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    };
    const leave = () => {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    };
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    return () => {
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <div className="avatar-card dz" ref={cardRef}>
      <div className="avatar-scene">
        <div className="avatar-sparks" aria-hidden="true">
          {SPARKS.map(([x, y, d], i) => (
            <span key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
          ))}
        </div>
        <div className="avatar-halo" aria-hidden="true" />
        <div className="avatar-figure" ref={figRef}>
          {geo && <Ring side="back" geo={geo} />}
          <img src={profile.avatar} alt={`3D avatar of ${profile.name}`} width="606" height="689" fetchPriority="high" decoding="async" />
          {geo && <Ring side="front" geo={geo} />}
        </div>
      </div>
      {floating.map((b, i) => (
        <img key={b.name} className={`avatar-badge b${i + 1}`} src={b.image} alt="" aria-hidden="true" decoding="async" />
      ))}
      <span className="avatar-tag">
        <i aria-hidden="true" />
        {profile.name}
      </span>
    </div>
  );
}
