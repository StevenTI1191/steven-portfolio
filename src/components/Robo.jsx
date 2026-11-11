import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { robo } from '../data/profile.js';

// Free-typed questions per visitor per day (quick questions don't count).
// The server has its own per-minute limit; this just keeps casual spam off the AI quota.
const DAILY_AI_LIMIT = 20;
const QUOTA_KEY = 'robo-ai-quota';

function today() {
  return new Date().toISOString().slice(0, 10);
}
function readQuota() {
  try {
    const q = JSON.parse(localStorage.getItem(QUOTA_KEY) || 'null');
    return q && q.day === today() ? q.count : 0;
  } catch {
    return 0;
  }
}
function bumpQuota() {
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify({ day: today(), count: readQuota() + 1 }));
  } catch {
    /* storage blocked: the server limit still applies */
  }
}

// Robo replies in the visitor's language, so pick a matching voice for Indonesian replies
const ID_WORDS = /\b(yang|dan|adalah|dengan|saya|dia|untuk|tidak|ini|itu|bisa|sudah|juga|dari|ke|di)\b/gi;
function guessLang(text) {
  return (text.match(ID_WORDS) || []).length >= 2 ? 'id-ID' : 'en-US';
}

// Browser speech-to-text (Chrome, Edge, Safari). Missing in Firefox, where the mic button is hidden.
const SpeechRec = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// Picks an offline answer when the AI endpoint is unavailable
// Keywords (English and Indonesian) → the quick question whose text contains the hint
const OFFLINE_TOPICS = [
  [/(certif|sertifikat|badge|lisensi|license|aws|oracle|cisco|ccna)/, 'certification'],
  [/(speak|language|bahasa|chinese|mandarin|english|inggris)/, 'languages'],
  [/(contact|email|hire|reach|linkedin|kontak|hubungi|rekrut)/, 'contact'],
  [/(skill|stack|tool|keahlian|kemampuan|teknologi|bisa apa)/, 'skills'],
  [/(project|build|built|proyek|projek|bikin|membuat|aplikasi)/, 'projects'],
  [/(who|about|do|steven|siapa|kerja|work)/, 'does Steven do'],
];
function offlineAnswer(q) {
  const s = q.toLowerCase();
  const exact = robo.quick.find((x) => x.q.toLowerCase() === s);
  if (exact) return exact.a;
  for (const [re, hint] of OFFLINE_TOPICS) {
    if (!re.test(s)) continue;
    const hit = robo.quick.find((x) => x.q.toLowerCase().includes(hint.toLowerCase()));
    if (hit) return hit.a;
  }
  return robo.fallback;
}

const Robo = forwardRef(function Robo(_, ref) {
  const canvasRef = useRef(null);
  const bot = useRef({ talking: false, act: null, actT: 0, look: { x: 0, y: 0 }, scrollKick: 0 }).current;
  const [has3d, setHas3d] = useState(true);
  const [ready3d, setReady3d] = useState(false);
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

  // 3D scene. Three.js is large, so it loads in its own file only after the page
  // has rendered and the browser is idle. Visitors with Data Saver on get the light button.
  useEffect(() => {
    if (navigator.connection?.saveData) {
      setHas3d(false);
      return;
    }
    let cancelled = false;
    let cleanup = null;
    const start = () => {
      import('./robotScene.js')
        .then(({ createRobotScene }) => {
          if (cancelled || !canvasRef.current) return;
          cleanup = createRobotScene(canvasRef.current, bot);
          if (cleanup) setReady3d(true);
          else setHas3d(false);
        })
        .catch(() => !cancelled && setHas3d(false));
    };
    const idle = window.requestIdleCallback
      ? (fn) => window.requestIdleCallback(fn, { timeout: 2500 })
      : (fn) => setTimeout(fn, 1200);
    const schedule = () => idle(start);
    if (document.readyState === 'complete') schedule();
    else addEventListener('load', schedule, { once: true });
    return () => {
      cancelled = true;
      removeEventListener('load', schedule);
      cleanup?.();
    };
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
            const lang = guessLang(line);
            u.lang = lang;
            u.rate = 1.02;
            const v = speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith(lang.slice(0, 2)));
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

  // After a quiet moment, Robo points out the hidden terminal (once, if the visitor hasn't interacted)
  const quiet = useRef({ interacted: false, bubbleOpen: true, chatOpen: false });
  quiet.current.bubbleOpen = bubbleOpen;
  quiet.current.chatOpen = chatOpen;
  if (chatOpen || idx >= 0) quiet.current.interacted = true;
  useEffect(() => {
    if (!robo.terminalHint) return;
    const t = setTimeout(() => {
      const q = quiet.current;
      if (q.interacted || q.chatOpen || !q.bubbleOpen) return;
      setText(robo.terminalHint);
      setIdx(-1);
      act('wave');
    }, 15000);
    return () => clearTimeout(t);
  }, [act]);

  const answer = (reply) => {
    setHistory((h) => [...h, { role: 'assistant', content: reply }]);
    setThinking(false);
    act('wave');
    say(reply);
  };

  // Quick questions answer instantly from profile.js and never use the AI quota
  const askQuick = (item) => {
    if (thinking) return;
    setHistory((h) => [...h, { role: 'user', content: item.q }]);
    act('nod');
    answer(item.a);
  };

  const ask = async (question) => {
    const q = question.trim();
    if (!q || thinking) return;
    const next = [...history, { role: 'user', content: q }];
    setHistory(next);
    setInput('');
    setMicMsg('');
    setThinking(true);
    act('nod');

    if (readQuota() >= DAILY_AI_LIMIT) {
      answer(`I've answered a lot of questions today, so I'm resting my AI brain. ${offlineAnswer(q)}`);
      return;
    }

    let reply = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-8) }),
      });
      if (res.status === 429) {
        reply = "You're asking faster than I can think! Give me a minute, or tap a quick question.";
      } else if (res.ok) {
        const data = await res.json();
        reply = (data.reply || '').trim();
        if (reply) bumpQuota();
      }
    } catch {
      reply = '';
    }
    answer(reply || offlineAnswer(q));
  };

  // The terminal's "ask <question>" command hands the question to Robo
  const askRef = useRef(ask);
  askRef.current = ask;
  useEffect(() => {
    const onAsk = (e) => {
      setChatOpen(true);
      askRef.current(String(e.detail || ''));
    };
    addEventListener('robo-ask', onAsk);
    return () => removeEventListener('robo-ask', onAsk);
  }, []);

  // Konami code: Robo shows off his dance moves
  const sayRef = useRef(say);
  sayRef.current = say;
  useEffect(() => {
    const timers = [];
    const onKonami = () => {
      act('spin');
      timers.push(setTimeout(() => act('jump'), 1150));
      timers.push(setTimeout(() => act('spin'), 2000));
      timers.push(setTimeout(() => act('wave'), 3150));
      sayRef.current('Up, up, down, down, left, right, left, right, B, A! You found my secret dance moves.');
    };
    addEventListener('konami', onKonami);
    return () => {
      removeEventListener('konami', onKonami);
      timers.forEach(clearTimeout);
    };
  }, [act]);

  // Voice input: tap the mic, speak, and the question is sent when you stop talking
  const [listening, setListening] = useState(false);
  const [micMsg, setMicMsg] = useState('');
  const recRef = useRef(null);
  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    if (!SpeechRec) return;
    stop(); // don't let Robo hear himself
    setMicMsg('');
    let finalText = '';
    const rec = new SpeechRec();
    rec.lang = (navigator.language || '').toLowerCase().startsWith('id') ? 'id-ID' : 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      const msg = {
        'not-allowed': 'Microphone access is blocked. Allow it in your browser, or type instead.',
        'service-not-allowed': 'Voice input is turned off in this browser. You can type instead.',
        'no-speech': "I didn't catch that. Tap the mic and try again.",
        'audio-capture': 'No microphone found. You can type instead.',
        network: 'Voice input needs an internet connection.',
      }[e.error];
      if (msg) setMicMsg(msg);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      const q = finalText.trim();
      if (q && !rec.cancelled) askRef.current(q);
    };
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
      act('nod');
    } catch {
      setMicMsg("Voice input couldn't start. You can type instead.");
    }
  };
  // Closing the chat (or leaving the page) cancels listening without sending anything
  const cancelMic = () => {
    const rec = recRef.current;
    if (!rec) return;
    rec.cancelled = true;
    try { rec.abort(); } catch { /* already stopped */ }
  };
  useEffect(() => {
    if (!chatOpen) cancelMic();
  }, [chatOpen]);
  useEffect(() => () => cancelMic(), []);

  const words = text.split(' ');
  const pct = idx < 0 ? 0 : Math.min(100, Math.round(((idx + 1) / words.length) * 100));

  return (
    <div className="dock">
      {has3d && (
        <canvas
          ref={canvasRef}
          id="bot"
          className={ready3d ? 'ready' : undefined}
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
                <button key={x.q} type="button" className="quick" onClick={() => askQuick(x)} disabled={thinking}>
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
              <input
                id="robo-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? 'Listening… speak now' : 'What has Steven built?'}
                maxLength={300}
                autoComplete="off"
              />
              {SpeechRec && (
                <button
                  type="button"
                  className={`mic-btn${listening ? ' on' : ''}`}
                  onClick={toggleMic}
                  disabled={thinking}
                  aria-pressed={listening}
                  aria-label={listening ? 'Stop listening' : 'Ask by voice'}
                  title={listening ? 'Stop listening' : 'Ask by voice'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0014 0M12 18v3" />
                  </svg>
                </button>
              )}
              <button className="btn primary sm" type="submit" disabled={thinking || !input.trim()}>Send</button>
            </form>
            {(listening || micMsg) && (
              <p className={`mic-msg${listening ? ' live' : ''}`} role="status">
                {listening ? 'Listening… stop talking to send.' : micMsg}
              </p>
            )}
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
