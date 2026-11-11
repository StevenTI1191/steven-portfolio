import { profile, robo } from '../data/profile.js';
import Button from './Button.jsx';
import AvatarCard from './AvatarCard.jsx';
import Typewriter from './Typewriter.jsx';

export default function Hero({ onTalk }) {
  const [first, last] = profile.name.split(' ');
  const words = [
    { t: "Hi,", c: 'wd' },
    { t: "I'm", c: 'wd' },
    { t: first, c: 'wd grad' },
    { t: `${last}.`, c: 'wd grad last' },
  ];

  return (
    <section className="hero" id="top">
      <div className="hero-text">
        <span className="status">
          {profile.status} · {profile.location}
        </span>
        <p className="label">
          {profile.school} · {profile.role}
        </p>
        <h1>
          {words.map((w, i) => (
            <span key={i}>
              <span className={w.c} style={{ animationDelay: `${0.08 + i * 0.12}s` }}>
                {w.t}
              </span>
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>
        <Typewriter prefix="I build" words={profile.typeRoles} />
        <p className="lead">
          {profile.lead} {profile.leadExtra}
        </p>
        <div className="row">
          <Button primary onClick={onTalk}>
            Talk to {robo.name}
          </Button>
          <Button href={profile.cv} download="Steven-Lim-CV.pdf">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
            Download CV
          </Button>
          <Button href="#work">See projects</Button>
        </div>
        <div className="hero-meta">
          {profile.heroTags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
      {profile.avatar && <AvatarCard />}
    </section>
  );
}
