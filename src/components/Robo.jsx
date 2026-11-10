import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { robo } from '../data/profile.js';
import { createRobotScene } from './robotScene.js';

// Picks an offline answer when the AI endpoint is unavailable
function offlineAnswer(q) {
  const s = q.toLowerCase();
  const match =
    robo.quick.find((x) => x.q.toLowerCase() === s) ||
    (/(skill|stack|tool|language)/.test(s) && robo.quick[2]) ||
    (/(project|build|built|work)/.test(s) && robo.quick[1]) ||
    (/(contact|email|hire|reach|linkedin)/.test(s) && robo.quick[3]) ||
    (/(who|about|do|steven)/.test(s) && robo.quick[0]);
  return match ? match.a : robo.fallback;
}

const Robo = forwardRef(function Robo(_, ref) {
  const canvasRef = useRef(null);
  const bot = useRef({ talking: false, act: null, actT: 0, look: { x: 0, y: 0 }, scrollKick: 0 }).current;
  const [has3d, setHas3d] = useState(true);
  const [text, setText] = useState(robo.greeting);
  const [idx, setIdx] = useState(-1);
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [history, setHistory] = useState([]); // [{role:'user'|'assistant', content}]
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const timer = useRef(null);
  const listEnd = useRef(null);

  const act = useCallback((kind) => {
    bot.act = kind;
    bot.actT = 0;
  }, [bot]);

  // 3D scene
  useEffect(() => {
    const cleanup = createRobotScene(canvasRef.current, bot);
    if (!cleanup) setHas3d(false);
    return () => cleanup?.();
  }, [bot]);

  // Robo looks toward the pointer and leans when the page scrolls
  useEffect(() => {
    const look = (x, y) => {
      const r = canvasRef.current?.getBoundingClientRect();
      if (!r) return;
      bot.look.x = Math.max(-1, Math.min(1, (x - (r.left + r.width / 2)) / (innerWidth * 0.5)));
      bot.look.y = Math.max(-1, Math.min(1, (y - (r.top + r.height * 0.35)) / (innerHeight * 0.5)));
    };
    const onPointer = (e) => look(e.clientX, e.clientY);
    let lastY = scrollY;
    const onScroll = () => {
      const d = scrollY - lastY;
      lastY = scrollY;
      bot.scrollKick = Math.max(-1, Math.min(1, bot.scrollKick + d * 0.004));
    };
    addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('pointerdown', onPointer, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    return () => {
      removeEventListener('pointermove', onPointer);
      removeEventListener('pointerdown', onPointer);
      removeEventListener('scroll', onScroll);
    };
  }, [bot]);

  const stop = useCallback(() => {
    clearInterval(timer.current);
    bot.talking = false;
    try { speechSynthesis.cancel(); } catch { /* not supported */ }
  }, [bot]);

  // Speak a line with word-by-word highlight
  const say = useCallback(
    (line) => {
      stop();
      setBubbleOpen(true);
      setText(line);
      setIdx(0);
      bot.talking = true;
      const words = line.split(' ');
      const n = words.length;
      const finish = () => {
        clearInterval(timer.current);
        bot.talking = false;
        setIdx(n);
        act('nod');
      };
      let gotBoundary = false;
      let voiced = false;
      if (voiceOn) {
        try {
          if ('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(line);
            u.lang = 'en-US';
            u.rate = 1.02;
            const v = speechSynthesis.getVoices().find((x) => /^en/i.test(x.lang));
            if (v) u.voice = v;
            u.onboundary = (e) => {
              if (e.name && e.name !== 'word') return;
              gotBoundary = true;
              const before = line.slice(0, e.charIndex).trim();
              setIdx(before ? before.split(' ').length : 0);
            };
            u.onend = finish;
            u.onerror = finish;
            speechSynthesis.speak(u);
            voiced = true;
          }
        } catch {
          voiced = false;
        }
      }
      let i = 0;
      timer.current = setInterval(() => {
        if (gotBoundary) return;
        i++;
        if (i >= n) {
          if (!voiced) finish();
          else clearInterval(timer.current);
          return;
        }
        setIdx(i);
      }, 330);
    },
    [act, bot, stop, voiceOn]
  );

  useImperativeHandle(ref, () => ({
    say,
    act,
    intro: () => {
      act('jump');
      say(robo.intro);
    },
  }), [say, act]);

  useEffect(() => () => stop(), [stop]);

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: 'nearest' });
  }, [history, thinking]);

  const ask = async (question) => {
    const q = question.trim();
    if (!q || thinking) return;
    const next = [...history, { role: 'user', content: q }];
    setHistory(next);
    setInput('');
    setThinking(true);
    act('nod');
    let reply = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-8) }),
      });
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      reply = (data.reply || '').trim();
    } catch {
      reply = '';
    }
    if (!reply) reply = offlineAnswer(q);
    setHistory((h) => [...h, { role: 'assistant', content: reply }]);
    setThinking(false);
    act('wave');
    say(reply);
  };

  const words = text.split(' ');
  const pct = idx < 0 ? 0 : Math.min(100, Math.round(((idx + 1) / words.length) * 100));

  return (
    <div className="dock">
      {has3d && (
        <canvas
          ref={canvasRef}
          id="bot"
          role="button"
          tabIndex={0}
          aria-label="Robo, a 3D assistant. Tap to chat."
          onClick={() => {
            act('jump');
            setChatOpen(true);
            say(robo.poke);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setChatOpen(true);
              say(robo.poke);
            }
          }}
        />
      )}

      {!has3d && (
        <button className="robo-fallback" type="button" aria-label="Chat with Robo" onClick={() => setChatOpen(true)}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="4" /><path d="M12 3v4M9 13h.01M15 13h.01" /></svg>
        </button>
      )}

      <div className="dock-col">
        {chatOpen && (
          <div className="chat" role="dialog" aria-label="Chat with Robo">
            <div className="chat-head">
              <b>Ask Robo</b>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="icon-btn" type="button" aria-pressed={voiceOn} aria-label={voiceOn ? 'Mute voice' : 'Turn voice on'} onClick={() => { if (voiceOn) stop(); setVoiceOn((v) => !v); }}>
                  {voiceOn ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M22 9l-6 6M16 9l6 6" /></svg>
                  )}
                </button>
                <button className="icon-btn" type="button" aria-label="Close chat" onClick={() => setChatOpen(false)}>×</button>
              </div>
            </div>
            <div className="chat-list">
              {history.length === 0 && <p className="chat-empty">Pick a question or type your own.</p>}
              {history.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>{m.content}</div>
              ))}
              {thinking && (
                <div className="chat-msg assistant typing" aria-label="Robo is thinking"><i /><i /><i /></div>
              )}
              <span ref={listEnd} />
            </div>
            <div className="chat-quick">
              {robo.quick.map((x) => (
                <button key={x.q} type="button" className="quick" onClick={() => ask(x.q)} disabled={thinking}>
                  {x.q}
                </button>
              ))}
            </div>
            <form
              className="chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
            >
              <label htmlFor="robo-input" className="sr-only">Your question</label>
              <input id="robo-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="What has Steven built?" maxLength={300} autoComplete="off" />
              <button className="btn primary sm" type="submit" disabled={thinking || !input.trim()}>Send</button>
            </form>
          </div>
        )}

        {bubbleOpen && !chatOpen && (
          <div className="bubble" aria-live="polite">
            <button className="x" type="button" aria-label="Close bubble" onClick={() => { stop(); setBubbleOpen(false); }}>×</button>
            <div>
              {words.map((w, i) => (
                <span key={i}>
                  <span className={`w${i === idx ? ' on' : ''}`}>{w}</span>
                  {i < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </div>
            <div className="bar"><i style={{ width: pct + '%' }} /></div>
            <button className="ask-btn" type="button" onClick={() => setChatOpen(true)}>Ask me anything →</button>
          </div>
        )}
      </div>
    </div>
  );
});

export default Robo;
