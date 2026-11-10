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

const SOCIALS = [
  {
    label: 'GitHub',
    href: profile.github,
    handle: profile.github.replace(/^https?:\/\/(www\.)?github\.com\//, '@'),
    svg: (
      <svg {...icon}>
        <path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: profile.linkedin,
    handle: 'Steven Lim',
    svg: (
      <svg {...icon}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 014 0v4M12 10v7" />
      </svg>
    ),
  },
  {
    label: 'Gmail',
    href: `mailto:${profile.email}`,
    handle: profile.email,
    svg: (
      <svg {...icon}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [time, setTime] = useState(localTime);
  useEffect(() => {
    const t = setInterval(() => setTime(localTime()), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer>
      <div className="wordmark" aria-hidden="true">{profile.name}</div>
      <nav className="socials" aria-label="Find me online">
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            className="social"
            href={s.href}
            {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
          >
            <span className="social-ico">{s.svg}</span>
            <span className="social-txt">
              <b>{s.label}</b>
              <span>{s.handle}</span>
            </span>
            <span className="social-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
      <div className="foot-row">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>
          It's <span className="clock">{time}</span> in Riau (GMT+7)
        </span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
