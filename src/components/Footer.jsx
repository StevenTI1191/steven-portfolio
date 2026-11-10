import { useEffect, useState } from 'react';
import { profile } from '../data/profile.js';

function localTime() {
  try {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: profile.timezone }).format(new Date());
  } catch {
    return '--:--';
  }
}

const icon = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const ICONS = {
  github: (
    <svg {...icon}>
      <path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  ),
  linkedin: (
    <svg {...icon}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 014 0v4M12 10v7" />
    </svg>
  ),
  mail: (
    <svg {...icon}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
};

const NAV = [
  { href: '#exp', label: 'Experience' },
  { href: '#work', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#cert', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
];

const CONNECT = [
  { href: profile.github, label: 'GitHub', ext: true },
  { href: profile.linkedin, label: 'LinkedIn', ext: true },
  { href: `mailto:${profile.email}`, label: 'Email' },
  { href: profile.cv, label: 'Download CV', download: 'Steven-Lim-CV.pdf' },
];

export default function Footer() {
  const [time, setTime] = useState(localTime);
  useEffect(() => {
    const t = setInterval(() => setTime(localTime()), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="site-footer">
      <div className="foot-grid">
        <div className="foot-brand">
          <a className="logo" href="#top">
            <i>{profile.initials}</i>
            {profile.name}
          </a>
          <p>Full-stack web developer and Information Technology student at {profile.school}.</p>
          <div className="foot-icons">
            <a href={profile.github} target="_blank" rel="noopener" aria-label="GitHub">{ICONS.github}</a>
            <a href={profile.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">{ICONS.linkedin}</a>
            <a href={`mailto:${profile.email}`} aria-label="Email">{ICONS.mail}</a>
          </div>
        </div>

        <nav className="foot-col" aria-label="Footer">
          <p className="foot-title">Navigate</p>
          {NAV.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <div className="foot-col">
          <p className="foot-title">Connect</p>
          {CONNECT.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.ext ? { target: '_blank', rel: 'noopener' } : {})}
              {...(l.download ? { download: l.download } : {})}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="foot-col">
          <p className="foot-title">Info</p>
          <span>{profile.location}</span>
          <span>
            Local time <span className="clock">{time}</span> (GMT+7)
          </span>
          <span className="foot-status">{profile.status}</span>
          <a href={`mailto:${profile.email}`} className="foot-mail">{profile.email}</a>
        </div>
      </div>

      <div className="foot-row">
        <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
