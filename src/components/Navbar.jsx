import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile.js';

const LINKS = [
  { href: '#exp', label: 'Experience' },
  { href: '#work', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#cert', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });
  const headerRef = useRef(null);
  const progRef = useRef(null);
  const linkRefs = useRef({});

  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href));
    const onScroll = () => {
      const y = scrollY;
      const h = document.documentElement.scrollHeight - innerHeight;
      if (progRef.current) progRef.current.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      setScrolled(y > 10);
      let cur = null;
      sections.forEach((s, i) => {
        if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = LINKS[i].href;
      });
      setActive(cur);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const a = active && linkRefs.current[active];
    setPill(a ? { left: a.offsetLeft, width: a.offsetWidth, opacity: 1 } : { left: 0, width: 0, opacity: 0 });
  }, [active]);

  useEffect(() => {
    const close = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <header ref={headerRef} className={`top${open ? ' open' : ''}${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar">
        <a className="logo" href="#top">
          <i>{profile.initials}</i>
          {profile.name}
        </a>
        <nav className="links" id="links" aria-label="Main">
          <span className="pill" style={{ left: pill.left, width: pill.width, opacity: pill.opacity }} />
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              ref={(el) => (linkRefs.current[l.href] = el)}
              className={active === l.href ? 'active' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <button
          className="menu-btn"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="links"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
        </button>
        <div className="progress" aria-hidden="true">
          <i ref={progRef} />
        </div>
      </div>
    </header>
  );
}
