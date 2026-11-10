import { profile } from '../data/profile.js';
import Button from './Button.jsx';

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
      <p className="lead">
        {profile.lead} {profile.leadExtra}
      </p>
      <div className="row">
        <Button primary onClick={onTalk}>
          Talk to Robo
        </Button>
        <Button href="#work">See projects</Button>
      </div>
      <div className="hero-meta">
        {profile.heroTags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </section>
  );
}
