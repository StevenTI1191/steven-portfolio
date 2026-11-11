import { useEffect, useRef } from 'react';

// A rotating 3D sphere of skill tags. It spins on its own, follows the pointer,
// and can be dragged. Plain DOM + rAF, no extra library.
export default function SkillSphere({ items }) {
  const boxRef = useRef(null);
  const tagRefs = useRef([]);

  useEffect(() => {
    const box = boxRef.current;
    const tags = tagRefs.current.filter(Boolean);
    const n = tags.length;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Spread points evenly on a unit sphere (Fibonacci lattice)
    const pts = tags.map((_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return [Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)];
    });

    let radius = 150;
    const measure = () => {
      const r = box.getBoundingClientRect();
      radius = Math.min(r.width, r.height) * 0.4;
    };
    measure();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    ro?.observe(box);

    let ax = 0.4, ay = 0;
    let vx = 0, vy = 0.004;
    let target = { x: 0, y: 0.004 };
    let dragging = false, last = null, hovering = false;

    const onMove = (e) => {
      const r = box.getBoundingClientRect();
      if (dragging && last) {
        vy = (e.clientX - last.x) * 0.0009;
        vx = -(e.clientY - last.y) * 0.0009;
        last = { x: e.clientX, y: e.clientY };
        return;
      }
      if (e.pointerType !== 'mouse') return;
      hovering = true;
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      target = { x: -dy * 0.012, y: dx * 0.012 };
    };
    const onDown = (e) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
      box.setPointerCapture?.(e.pointerId);
    };
    const onUp = () => {
      dragging = false;
      last = null;
    };
    const onLeave = () => {
      hovering = false;
      target = { x: 0, y: 0.004 };
    };
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerdown', onDown);
    box.addEventListener('pointerup', onUp);
    box.addEventListener('pointercancel', onUp);
    box.addEventListener('pointerleave', onLeave);

    // Only animate while the sphere is on screen, to save battery on phones
    let raf = 0;
    let onScreen = true;
    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([e]) => {
            onScreen = e.isIntersecting;
            if (onScreen && !raf) raf = requestAnimationFrame(draw);
          })
        : null;
    io?.observe(box);

    const draw = () => {
      if (!onScreen) {
        raf = 0;
        return;
      }
      if (!dragging) {
        const t = hovering ? target : { x: 0, y: 0.004 };
        vx += (t.x - vx) * 0.05;
        vy += (t.y - vy) * 0.05;
      }
      if (!reduce || dragging) {
        ax += vx;
        ay += vy;
      }
      const sx = Math.sin(ax), cx = Math.cos(ax), sy = Math.sin(ay), cy = Math.cos(ay);
      pts.forEach(([x, y, z], i) => {
        // rotate around Y, then X
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back, 1 front
        const s = 0.6 + depth * 0.6;
        const el = tags[i];
        el.style.transform = `translate(-50%, -50%) translate3d(${x1 * radius}px, ${y2 * radius}px, 0) scale(${s})`;
        el.style.opacity = String(0.25 + depth * 0.75);
        el.style.zIndex = String(Math.round(depth * 100));
        el.style.filter = depth < 0.35 ? 'blur(1px)' : 'none';
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerdown', onDown);
      box.removeEventListener('pointerup', onUp);
      box.removeEventListener('pointercancel', onUp);
      box.removeEventListener('pointerleave', onLeave);
    };
  }, [items]);

  return (
    <div className="sphere-wrap dz">
      <div className="sphere" ref={boxRef} role="img" aria-label={`Skills: ${items.join(', ')}`}>
        <div className="sphere-ring" aria-hidden="true" />
        <div className="sphere-core" aria-hidden="true">
          <b>{items.length}</b>
          <span>skills</span>
        </div>
        {items.map((t, i) => (
          <span key={t} className={`sphere-tag${i % 4 === 0 ? ' hot' : ''}`} ref={(el) => (tagRefs.current[i] = el)} aria-hidden="true">
            {t}
          </span>
        ))}
      </div>
      <p className="sphere-hint" aria-hidden="true">Drag to spin</p>
    </div>
  );
}
