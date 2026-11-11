// Terminal commands. Everything is read from profile.js, so the terminal
// always matches the page. Pure logic only (no React), so it can be tested on its own.

import { profile, projects, toolGroups, badges, experience, robo } from '../data/profile.js';

// A line is a string, or { t: text, c: 'dim' | 'ok' | 'err' | 'accent' | 'head' }
const dim = (t) => ({ t, c: 'dim' });
const ok = (t) => ({ t, c: 'ok' });
const err = (t) => ({ t, c: 'err' });
const head = (t) => ({ t, c: 'head' });
const shown = (v) => v && !String(v).startsWith('[');

export const FILES = {
  'about.txt': () => [profile.lead, profile.leadExtra].filter(shown),
  'skills.json': () => [
    '{',
    ...toolGroups.map((g, i) => `  "${g.title}": [${g.items.map((x) => `"${x}"`).join(', ')}]${i < toolGroups.length - 1 ? ',' : ''}`),
    '}',
  ],
  'contact.txt': () => [`email     ${profile.email}`, `linkedin  ${profile.linkedin}`, `github    ${profile.github}`],
};

export const HELP = [
  ['whoami', 'who Steven is'],
  ['about', 'a short intro'],
  ['skills', 'tools and languages'],
  ['projects', 'things Steven has built'],
  ['open <n>', 'jump to project n on the page'],
  ['certs', 'licenses and certifications'],
  ['experience', 'where Steven has worked'],
  ['contact', 'email and links (copies the email)'],
  ['github / linkedin', 'open the profile'],
  ['ask <question>', `ask ${robo.name} anything`],
  ['ls, cat <file>', 'look around'],
  ['clear, exit', 'tidy up or close'],
];

export const COMMAND_NAMES = ['help', 'whoami', 'about', 'skills', 'projects', 'open', 'certs', 'experience', 'contact', 'github', 'linkedin', 'ask', 'ls', 'cat', 'clear', 'exit', 'sudo', 'date', 'echo'];

// Returns { lines, action } where action is something the UI should do
export function run(raw) {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const [cmd, ...rest] = input.split(/\s+/);
  const arg = rest.join(' ');
  const c = cmd.toLowerCase();

  switch (c) {
    case 'help':
      return {
        lines: [
          head('Available commands'),
          ...HELP.map(([k, d]) => `  ${k.padEnd(20)}${d}`),
          dim('  …and a couple of secrets. Hints: sudo, and a famous cheat code.'),
          dim('Tip: ↑/↓ for history, Tab to complete.'),
        ],
      };
    case 'whoami':
      return {
        lines: [
          head(profile.name),
          `${profile.role} student at ${profile.school}`,
          `${profile.location} · ${profile.status}`,
        ],
      };
    case 'about':
      return { lines: FILES['about.txt']() };
    case 'skills':
      return {
        lines: toolGroups.flatMap((g) => [head(g.title), `  ${g.items.join(' · ')}`]),
      };
    case 'projects':
      return {
        lines: [
          ...projects.flatMap((p, i) => [
            `  ${String(i + 1).padStart(2)}. ${p.title}`,
            dim(`      ${[...new Set([...p.tag.split(' · '), ...(p.stack || [])])].join(' · ')}`),
          ]),
          dim(`Type "open 1" to jump to a project.`),
        ],
      };
    case 'open': {
      const n = parseInt(arg, 10);
      if (!n || n < 1 || n > projects.length) return { lines: [err(`open: pick a number from 1 to ${projects.length}`)] };
      return { lines: [ok(`→ Opening ${projects[n - 1].title}…`)], action: { type: 'project', index: n - 1 } };
    }
    case 'certs':
      return {
        lines: [
          ...badges.map((b) => `  ${b.image ? '★' : '·'} ${b.name}${shown(b.issuer) ? ` — ${b.issuer}` : ''}`),
          dim('  ★ = has a badge on the shelf'),
        ],
      };
    case 'experience':
      return {
        lines: experience.flatMap((e) => [head(e.title), dim(`  ${e.when}`)]),
      };
    case 'contact':
      return {
        lines: FILES['contact.txt'](),
        action: { type: 'copy', text: profile.email },
      };
    case 'github':
    case 'linkedin':
      return { lines: [ok(`→ Opening ${c === 'github' ? 'GitHub' : 'LinkedIn'}…`)], action: { type: 'link', href: profile[c] } };
    case 'ask':
      if (!arg) return { lines: [err('ask: type a question, e.g. ask what did Steven build?')] };
      return { lines: [ok(`→ Passing your question to ${robo.name}…`)], action: { type: 'ask', text: arg } };
    case 'ls':
      return { lines: [`${Object.keys(FILES).join('   ')}   projects/`] };
    case 'cat': {
      if (!arg) return { lines: [err('cat: which file? Try "ls".')] };
      if (FILES[arg]) return { lines: FILES[arg]() };
      return { lines: [err(`cat: ${arg}: No such file`)] };
    }
    case 'date':
      return { lines: [new Date().toString()] };
    case 'echo':
      return { lines: [arg] };
    case 'konami':
      return { lines: [ok('↑ ↑ ↓ ↓ ← → ← → B A'), 'Cheat code accepted…'], action: { type: 'konami' } };
    case 'clear':
      return { lines: [], action: { type: 'clear' } };
    case 'exit':
      return { lines: [], action: { type: 'close' } };
    case 'sudo':
      if (/^hire\s+steven$/i.test(arg)) {
        return {
          lines: [ok('[sudo] password for recruiter: ********'), ok('✓ Permission granted. Great choice!'), '→ Opening the contact section…'],
          action: { type: 'hire' },
        };
      }
      return { lines: [err(`${arg ? arg.split(' ')[0] : 'sudo'}: you're not in the sudoers file. This incident will be reported.`), dim('Psst… try "sudo hire steven".')] };
    default:
      return { lines: [err(`command not found: ${cmd}`), dim('Type "help" to see what you can do.')] };
  }
}

// Tab completion: commands first, then file names after "cat "
export function complete(value) {
  const v = value.replace(/^\s+/, '');
  if (/^cat\s+/i.test(v)) {
    const part = v.replace(/^cat\s+/i, '');
    const hit = Object.keys(FILES).filter((f) => f.startsWith(part));
    return hit.length === 1 ? `cat ${hit[0]}` : value;
  }
  if (/\s/.test(v)) return value;
  const hit = COMMAND_NAMES.filter((n) => n.startsWith(v.toLowerCase()));
  return hit.length === 1 ? `${hit[0]} ` : value;
}
