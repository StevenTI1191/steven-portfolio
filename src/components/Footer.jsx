import { useEffect, useState } from 'react';
import { profile } from '../data/profile.js';

function localTime() {
  try {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: profile.timezone }).format(new Date());
  } catch {
    return '--:--';
  }
}

export default function Footer() {
  const [time, setTime] = useState(localTime);
  useEffect(() => {
    const t = setInterval(() => setTime(localTime()), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer>
      <div className="wordmark" aria-hidden="true">{profile.name}</div>
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
