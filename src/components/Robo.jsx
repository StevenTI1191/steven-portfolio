import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { badges, projects, robo } from '../data/profile.js';

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

// Robo replies in the visitor's language, so pick a voice that matches the reply.
// Common short words are a reliable enough signal for a line or two of text.
const LANG_WORDS = [
  ['id-ID', /\b(yang|dan|adalah|dengan|saya|dia|untuk|tidak|ini|itu|bisa|sudah|juga|dari|ke|di)\b/gi],
  ['de-DE', /\b(der|die|das|und|ist|nicht|ich|mit|hat|ein|eine|auch|für|sie|er|wie|kann)\b/gi],
  ['fr-FR', /\b(le|la|les|et|est|une|des|pour|avec|pas|il|elle|vous|dans|sur)\b/gi],
  ['es-ES', /\b(el|los|las|y|es|una|para|con|por|que|su|del|como|también)\b/gi],
];
function guessLang(text) {
  if ((text.match(/[\u4e00-\u9fff]/g) || []).length >= 2) return 'zh-CN';
  let best = 'en-US';
  let top = 1; // need at least 2 hits to switch away from English
  for (const [lang, re] of LANG_WORDS) {
    const n = (text.match(re) || []).length;
    if (n > top) {
      best = lang;
      top = n;
    }
  }
  return best;
}

// Robo's voice: the browser's built-in voices, pitched up for a small, friendly robot.
// Voices differ per device, so try well-known bright-sounding ones first, then any voice in that language.
const ROBO_PITCH = 1.4;
const ROBO_RATE = 1.06;
const PREFERRED_VOICES = {
  en: ['Google US English', 'Samantha', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Ana', 'Microsoft Zira', 'Karen', 'Tessa', 'Moira'],
  id: ['Google Bahasa Indonesia', 'Damayanti', 'Microsoft Gadis'],
  zh: ['Google 普通话（中国大陆）', 'Tingting', 'Ting-Ting', 'Microsoft Xiaoxiao', 'Microsoft Huihui'],
  de: ['Google Deutsch', 'Anna', 'Microsoft Katja', 'Microsoft Hedda'],
  fr: ['Google français', 'Amelie', 'Amélie', 'Microsoft Denise'],
  es: ['Google español', 'Monica', 'Mónica', 'Paulina', 'Microsoft Elvira'],
};
let voiceCache = [];
const loadVoices = () => {
  try {
    voiceCache = speechSynthesis.getVoices();
  } catch {
    voiceCache = [];
  }
};
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}
function pickVoice(lang) {
  if (!voiceCache.length) loadVoices();
  const code = lang.slice(0, 2);
  const inLang = voiceCache.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(code));
  for (const name of PREFERRED_VOICES[code] || []) {
    const v = inLang.find((x) => x.name.startsWith(name));
    if (v) return v;
  }
  return inLang.find((v) => v.lang.replace('_', '-') === lang) || inLang[0] || null;
}

// Speech-to-text language: the visitor's browser language when Robo can answer in it
const MIC_LANGS = { en: 'en-US', id: 'id-ID', zh: 'zh-CN', de: 'de-DE', fr: 'fr-FR', es: 'es-ES' };
const micLang = () => {
  const l = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  return MIC_LANGS[l.slice(0, 2).toLowerCase()] ? (l.includes('-') ? l : MIC_LANGS[l.slice(0, 2).toLowerCase()]) : 'en-US';
};

// Browser speech-to-text (Chrome, Edge, Safari). Missing in Firefox, where the mic button is hidden.
const SpeechRec = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

function VoiceIcon({ on, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      {on ? <path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14" /> : <path d="M22 9l-6 6M16 9l6 6" />}
    </svg>
  );
}

// ---- Scroll tour: Robo explains whatever the visitor has scrolled to ----
const TOUR_OFF_KEY = 'robo-tour-off';
const SECTION_IDS = ['exp', 'skills', 'cert', 'contact'];

// Which section (or which project card) sits in the middle of the screen right now
function currentSpot() {
  if (document.getElementById('intro')) return null;
  const mid = innerHeight * 0.45;
  const inMid = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < mid && r.bottom > mid;
  };
  const work = document.getElementById('work');
  if (work && inMid(work)) {
    // Project cards stack on top of each other; the newest one past the middle is on top
    let cur = -1;
    work.querySelectorAll('article.sheet').forEach((c, i) => {
      if (c.getBoundingClientRect().top < mid) cur = i;
    });
    return cur >= 0 && projects[cur] ? `project:${projects[cur].id}` : null;
  }
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (el && inMid(el)) return id;
  }
  return null;
}

function tourLine(spot) {
  if (!spot) return '';
  if (spot.startsWith('project:')) {
    const i = projects.findIndex((p) => `project:${p.id}` === spot);
    const p = projects[i];
    if (!p) return '';
    return `Project ${i + 1} of ${projects.length}: ${p.title}. ${p.summary}.${p.stat ? ` ${p.stat.value}: ${p.stat.label}.` : ''}`;
  }
  return (robo.tour?.[spot] || '').replace('{certs}', badges.length);
}

// A longer offline explanation, used when the visitor asks about the current spot and the AI is unreachable
function spotDetail(spot) {
  if (spot?.startsWith('project:')) {
    const p = projects.find((x) => `project:${x.id}` === spot);
    if (p) return `${p.title}: ${p.summary}. Highlights: ${p.points.join('; ')}.${p.stack ? ` Built with ${p.stack.join(', ')}.` : ''}`;
  }
  return tourLine(spot);
}

function spotName(spot) {
  if (spot?.startsWith('project:')) return projects.find((x) => `project:${x.id}` === spot)?.title || 'this project';
  return { exp: 'his journey', skills: 'his skills', cert: 'his certifications', contact: 'getting in touch' }[spot] || 'this';
}

const readTourOff = () => {
  try {
    return sessionStorage.getItem(TOUR_OFF_KEY) === '1';
  } catch {
    return false;
  }
};

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
  // Voice on by default; the visitor's mute choice is remembered in this browser
  const [voiceOn, setVoiceOn] = useState(() => {
    try {
      return localStorage.getItem('robo-voice') !== 'off';
    } catch {
      return true;
    }
  });
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

  const toggleVoice = () => {
    const next = !voiceOn;
    readUntil.current = Date.now() + 4000; // the visitor just used the bubble: keep it up a moment
    if (!next) {
      stop();
      sayId.current++; // anything still speaking won't come back to change the bubble
      setIdx((i) => (i >= 0 ? text.split(' ').length : i)); // show the whole line at once
    }
    setVoiceOn(next);
    try {
      localStorage.setItem('robo-voice', next ? 'on' : 'off');
    } catch {
      /* storage blocked: the choice lasts for this page view */
    }
    voiceJustOn.current = next;
  };
  // Unmuting reads the current section aloud, so the visitor hears that the voice is back
  const voiceJustOn = useRef(false);

  const tourRef = useRef({ off: readTourOff(), last: null, spot: null, showing: false });
  const [tourOff, setTourOff] = useState(tourRef.current.off); // mirrors tourRef for the chat's "Resume tour" chip
  const readUntil = useRef(0);
  const [spot, setSpot] = useState(null); // mirrors tourRef.current.spot for the chat's "Explain …" chip

  // Speak a line with word-by-word highlight
  const sayId = useRef(0);
  const say = useCallback(
    (line, opts = {}) => {
      stop();
      const id = ++sayId.current; // a cancelled earlier line must not finish this one
      tourRef.current.showing = !!opts.tour;
      setBubbleOpen(true);
      setText(line);
      if (opts.silent) {
        // Tour lines are read, not spoken: show the whole line, give time to read it
        setIdx(line.split(' ').length);
        readUntil.current = Date.now() + Math.max(4500, line.split(' ').length * 300);
        act('nod');
        return;
      }
      readUntil.current = 0;
      setIdx(0);
      bot.talking = true;
      const words = line.split(' ');
      const n = words.length;
      const finish = () => {
        if (id !== sayId.current) return;
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
            u.rate = ROBO_RATE;
            u.pitch = ROBO_PITCH;
            const v = pickVoice(lang);
            if (v) u.voice = v;
            u.onboundary = (e) => {
              if (id !== sayId.current) return;
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
    // Give up after 20 seconds so Robo never stays stuck "thinking"
    const ctrl = new AbortController();
    const giveUp = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-8), context: tourRef.current.spot || undefined }),
        signal: ctrl.signal,
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
    } finally {
      clearTimeout(giveUp);
    }
    answer(reply || (askingHere.current ? spotDetail(tourRef.current.spot) : '') || offlineAnswer(q));
    askingHere.current = false;
  };

  // "Tell me more" about whatever is on screen right now
  const askingHere = useRef(false);
  const askHere = () => {
    const spot = tourRef.current.spot;
    if (!spot) return;
    setChatOpen(true);
    askingHere.current = true;
    ask(`Tell me more about ${spotName(spot)}.`);
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

  // Scroll tour: when the visitor settles on a section or project card, Robo explains it.
  // Each spot once per visit, text only. Closing a tour bubble turns the tour off for this visit.
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  useEffect(() => {
    let raf = 0;
    let settle = 0;
    const check = () => {
      raf = 0;
      const t = tourRef.current;
      const spot = currentSpot();
      if (spot === t.spot) return;
      t.spot = spot;
      setSpot(spot);
      clearTimeout(settle);
      // Explain every spot the visitor settles on, except the one Robo just explained
      if (!spot || t.off || spot === t.last) return;
      // Wait until the visitor stops on it, so fast scrolling doesn't fire a line per section
      settle = setTimeout(() => {
        const busy =
          chatOpenRef.current ||
          (bot.talking && !t.showing) || // a newer tour line may cut in on an older one, never on an answer
          document.documentElement.classList.contains('term-open') ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
        if (t.off || t.spot !== spot || busy) return;
        const line = tourLine(spot);
        if (!line) return;
        t.last = spot;
        // Browsers only allow speech after the visitor has clicked or tapped the page once;
        // until then (or when muted) the line is shown as text
        const activated = navigator.userActivation ? navigator.userActivation.hasBeenActive : true;
        say(line, { tour: true, silent: !voiceOn || !activated });
      }, 800);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [bot, say, voiceOn]);

  useEffect(() => {
    if (!voiceOn || !voiceJustOn.current) return;
    voiceJustOn.current = false;
    const t = tourRef.current;
    if (chatOpenRef.current) return;
    const line = !t.off && tourLine(t.spot);
    if (line) {
      t.last = t.spot;
      say(line, { tour: true });
    }
  }, [voiceOn, say]);

  const stopTour = () => {
    tourRef.current.off = true;
    setTourOff(true);
    try {
      sessionStorage.setItem(TOUR_OFF_KEY, '1');
    } catch {
      /* storage blocked: the tour still stops for this page view */
    }
  };
  const resumeTour = () => {
    const t = tourRef.current;
    t.off = false;
    t.last = null;
    setTourOff(false);
    try {
      sessionStorage.removeItem(TOUR_OFF_KEY);
    } catch {
      /* storage blocked */
    }
    setChatOpen(false);
    const line = tourLine(t.spot);
    if (line) {
      t.last = t.spot;
      say(line, { tour: true, silent: !voiceOn });
    }
  };

  // The bubble floats over the page, so it steps aside whenever it would cover a button,
  // link or form field. It stays put while Robo is talking, and comes back when he speaks again.
  const bubbleRef = useRef(null);
  useEffect(() => {
    const HIT = 'main a[href], main button, main input:not([tabindex="-1"]), main textarea, main select, footer a, footer button';
    let raf = 0;
    let later = 0;
    const check = () => {
      raf = 0;
      const el = bubbleRef.current;
      if (!el || bot.talking) return;
      if (Date.now() < readUntil.current) {
        // Still reading a tour line: look again once the reading time is up
        clearTimeout(later);
        later = setTimeout(schedule, readUntil.current - Date.now() + 50);
        return;
      }
      const r = el.getBoundingClientRect();
      const covers = [...document.querySelectorAll(HIT)].some((x) => {
        const q = x.getBoundingClientRect();
        return q.width > 0 && q.right > r.left && q.left < r.right && q.bottom > r.top && q.top < r.bottom;
      });
      if (covers) setBubbleOpen(false);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    const onFocus = (e) => {
      if (e.target?.closest?.('.dock')) return; // the visitor is using Robo's own buttons
      // Tapping into a form field: a tour line shouldn't sit on top of it
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '') && tourRef.current.showing && !e.target.closest('.chat')) {
        readUntil.current = 0;
        if (bot.talking) {
          // Robo goes quiet and steps aside once the visitor starts filling in a form
          stop();
          sayId.current++;
          setBubbleOpen(false);
          return;
        }
      }
      schedule();
    };
    addEventListener('focusin', onFocus);
    // Also check once the intro has lifted, and a few seconds after Robo finishes a line
    if (idx < 0) schedule();
    const t = setTimeout(schedule, idx >= 0 ? 3500 : 1800);
    return () => {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      removeEventListener('focusin', onFocus);
      clearTimeout(t);
      clearTimeout(later);
      cancelAnimationFrame(raf);
    };
  }, [bot, bubbleOpen, idx]);

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
    rec.lang = micLang();
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
      <div className="robo-spot">
        {has3d && (
          <canvas
            ref={canvasRef}
            id="bot"
            className={ready3d ? 'ready' : undefined}
            role="button"
            tabIndex={0}
            aria-label={`${robo.name}, a 3D assistant. Tap to chat.`}
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
          <button className="robo-fallback" type="button" aria-label={`Chat with ${robo.name}`} onClick={() => setChatOpen(true)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="4" /><path d="M12 3v4M9 13h.01M15 13h.01" /></svg>
          </button>
        )}

        <button
          className="dock-voice"
          type="button"
          aria-pressed={!voiceOn}
          aria-label={voiceOn ? `Mute ${robo.name}'s voice` : `Unmute ${robo.name}'s voice`}
          title={voiceOn ? `Mute ${robo.name}'s voice` : `Unmute ${robo.name}'s voice`}
          onClick={toggleVoice}
        >
          <VoiceIcon on={voiceOn} size={15} />
        </button>
      </div>

      <div className="dock-col">
        {chatOpen && (
          <div className="chat" role="dialog" aria-label={`Chat with ${robo.name}`}>
            <div className="chat-head">
              <b>Ask {robo.name}</b>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="icon-btn" type="button" aria-pressed={voiceOn} aria-label={voiceOn ? 'Mute voice' : 'Turn voice on'} onClick={toggleVoice}>
                  <VoiceIcon on={voiceOn} />
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
                <div className="chat-msg assistant typing" aria-label={`${robo.name} is thinking`}><i /><i /><i /></div>
              )}
              <span ref={listEnd} />
            </div>
            <div className="chat-quick">
              {tourOff && (
                <button type="button" className="quick here" onClick={resumeTour}>
                  Resume scroll tour
                </button>
              )}
              {spot && (
                <button type="button" className="quick here" onClick={askHere} disabled={thinking}>
                  Explain {spotName(spot)}
                </button>
              )}
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
          <div className="bubble" aria-live="polite" ref={bubbleRef}>
            <button
              className="x"
              type="button"
              aria-label={tourRef.current.showing ? 'Stop the scroll tour' : 'Close bubble'}
              title={tourRef.current.showing ? 'Stop the scroll tour' : undefined}
              onClick={() => {
                if (tourRef.current.showing) stopTour();
                stop();
                setBubbleOpen(false);
              }}
            >
              ×
            </button>
            <div>
              {words.map((w, i) => (
                <span key={i}>
                  <span className={`w${i === idx ? ' on' : ''}`}>{w}</span>
                  {i < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </div>
            <div className="bar"><i style={{ width: pct + '%' }} /></div>
            <div className="bubble-acts">
              {tourRef.current.showing ? (
                <button className="ask-btn" type="button" onClick={askHere}>Tell me more →</button>
              ) : (
                <button className="ask-btn" type="button" onClick={() => setChatOpen(true)}>Ask me anything →</button>
              )}
              <span className="bubble-tools">
                <button className="voice-btn" type="button" aria-pressed={!voiceOn} onClick={toggleVoice}>
                  <VoiceIcon on={voiceOn} size={13} />
                  {voiceOn ? 'Mute' : 'Unmute'}
                </button>
                {tourRef.current.showing && (
                  <button className="tour-off" type="button" onClick={() => { stopTour(); stop(); setBubbleOpen(false); }}>Stop tour</button>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Robo;
