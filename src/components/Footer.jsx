import { useEffect, useState } from 'react';
import { profile } from '../data/profile.js';
import { GitHubIcon, LinkedInIcon, MailIcon } from './icons.jsx';
import { openTerminal } from './Terminal.jsx';

function localTime() {
  try {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: profile.timezone }).format(new Date());
  } catch {
    return '--:--';
  }
}

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
            <a href={profile.github} target="_blank" rel="noopener" aria-label="GitHub"><GitHubIcon /></a>
            <a href={profile.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn"><LinkedInIcon /></a>
            <a href={`mailto:${profile.email}`} aria-label="Email"><MailIcon /></a>
          </div>
        </div>

        <nav className="foot-col" aria-label="Footer">
          <p className="foot-title">Navigate</p>
          {NAV.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
          <button type="button" className="foot-link" onClick={openTerminal}>
            Open terminal &gt;_
          </button>
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
