// All page content lives here. Edit this file to update the site;
// the components and Robo's AI context both read from it.
// Anything in [square brackets] is a placeholder to replace with your real info.

export const profile = {
  name: 'Steven Lim',
  initials: 'SL',
  role: '[Your role]',
  school: 'Politeknik Caltex Riau',
  location: 'Riau, Indonesia',
  timezone: 'Asia/Jakarta',
  status: 'Open to work',
  lead: 'I build web apps and AI agents that get used for real work.',
  leadExtra: '[Replace with one sentence about your focus.]',
  heroTags: ['Web development', 'AI agent', 'AWS'],
  email: '[your-email@gmail.com]',
  linkedin: 'https://www.linkedin.com/in/steven-lim-22b6ba2b2',
  github: 'https://github.com/',
  availability: 'Open to internships, jobs, and freelance projects. I usually reply within a day.',
};

// color: one of 'c1' blue, 'c2' purple, 'c3' green, 'c4' orange
// mock: 'laptop' | 'phone' | 'doc' (shown inside "View details")
// screenshot: optional path in /public, e.g. '/projects/inventory.png' (replaces the mock)
export const projects = [
  {
    id: 'inventory',
    color: 'c1',
    tag: 'Web app · Internship',
    meta: '2026 · Team build',
    title: 'Inventory System',
    summary: 'Stock tracking for PT Sari Dumai Sejati',
    points: ['Incoming and outgoing goods logged', 'Stock checks without paper records', 'Built with the intern team'],
    stat: { value: '[N]', label: '[Items tracked in the system]' },
    problem: '[What was hard before this system, e.g. stock was recorded by hand.]',
    mechanismLabel: 'Mechanism',
    mechanism: '[Stack, e.g. Laravel + MySQL; goods in and out are logged automatically.]',
    mock: 'laptop',
    screenshot: '',
    github: 'https://github.com/',
  },
  {
    id: 'ai-agent',
    color: 'c2',
    tag: 'AI agent · AWS',
    meta: '2026 · Solo build',
    title: '[AI project name]',
    summary: '[One sentence: what this agent does]',
    points: ['Answers from your own documents', 'Cites its sources', 'Runs on AWS free credits'],
    stat: { value: '[N]', label: '[Documents it can read]' },
    problem: '[Questions whose answers are scattered across many documents.]',
    mechanismLabel: 'Mechanism',
    mechanism: '[The agent reads documents, finds the relevant parts, then answers with sources.]',
    mock: 'phone',
    screenshot: '',
    github: 'https://github.com/',
  },
  {
    id: 'final-project',
    color: 'c3',
    tag: 'Research · Final project',
    meta: 'Politeknik Caltex Riau',
    title: '[Final project title]',
    summary: 'Being prepared as a journal article',
    points: ['[Main method]', '[Data used]', 'Turned into a journal article'],
    stat: { value: '[N]', label: '[Key result]' },
    problem: '[Background of the final project.]',
    mechanismLabel: 'Result',
    mechanism: '[Main result and the method used.]',
    mock: 'doc',
    screenshot: '',
    github: 'https://github.com/',
  },
];

export const marquee = {
  top: ['Python', 'JavaScript', 'SQL', 'AWS', 'LLM'],
  bottom: ['AI agent', 'Git', 'Linux', 'React'],
};

// icon: 'code' | 'cloud' | 'web'
export const toolGroups = [
  { title: 'Languages', icon: 'code', text: 'What I use every day for logic and data.', items: ['Python', 'JavaScript', 'SQL'] },
  { title: 'AI and cloud', icon: 'cloud', text: 'Building agents that run in the cloud at zero cost.', items: ['LLM', 'AI agent', 'AWS'] },
  { title: 'Web and data', icon: 'web', text: 'Web apps for real needs, like an inventory system.', items: ['React', '[Database]', 'Git'] },
];

// category: 'cloud' | 'ai' | 'web' (used by the filter tabs)
// image: put your badge file in /public/badges and write '/badges/your-file.png'.
//        Leave empty to show a generated placeholder shape.
// shape: 'hex' | 'circle' | 'shield' | 'diamond' (placeholder only)
export const badges = [
  { name: '[Cloud badge name]', issuer: '[Issuer]', year: '[Year]', category: 'cloud', link: 'https://www.credly.com/', image: '', shape: 'hex', color: '#EA580C', short: 'CLOUD' },
  { name: '[AI badge name]', issuer: '[Issuer]', year: '[Year]', category: 'ai', link: 'https://www.credly.com/', image: '', shape: 'circle', color: '#7C3AED', short: 'AI' },
  { name: '[Web certificate name]', issuer: '[Issuer]', year: '[Year]', category: 'web', link: 'https://www.credly.com/', image: '', shape: 'shield', color: '#2563EB', short: 'WEB' },
  { name: '[Another badge name]', issuer: '[Issuer]', year: '[Year]', category: 'cloud', link: 'https://www.credly.com/', image: '', shape: 'diamond', color: '#16A34A', short: 'AWS' },
];

export const badgeFilters = [
  { id: 'all', label: 'All' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'ai', label: 'AI' },
  { id: 'web', label: 'Web' },
];

export const experience = [
  { now: true, when: '[Month 2026] – present', title: 'Intern · PT Sari Dumai Sejati', text: 'Building an inventory system with the team. [Add one key contribution.]' },
  { when: '[Year] – present', title: 'Final project', text: 'Turning the research results into a journal article.' },
  { when: '[Start year] – [graduation]', title: 'Student · Politeknik Caltex Riau', text: '[Study program.]' },
];

// Robo: quick questions and the offline answers used when the AI is unavailable
export const robo = {
  greeting: "Hi! I'm Robo, Steven's assistant. Ask me anything about him.",
  intro: 'Hello! This is Steven Lim, a student at Politeknik Caltex Riau. He builds web apps and AI agents. Scroll down to see his projects.',
  poke: "Hey, that tickles! I'm Robo, Steven's assistant. Nice to meet you!",
  quick: [
    { q: 'What does Steven do?', a: 'Steven is a student at Politeknik Caltex Riau who builds web apps and AI agents. He is currently interning at PT Sari Dumai Sejati.' },
    { q: 'Tell me about his projects', a: 'He built an inventory system during his internship, an AI agent that answers from documents, and a final project that is becoming a journal article.' },
    { q: 'What are his skills?', a: 'Python, JavaScript, SQL, React, AWS, and building AI agents with large language models.' },
    { q: 'How can I contact him?', a: 'Scroll to the contact section to copy his email, or reach him on LinkedIn.' },
  ],
  fallback: "I can't reach my AI brain right now, but you can tap one of the quick questions, or check the sections below.",
};

// Plain-text summary used as the AI's knowledge (built from the data above)
export function buildKnowledge() {
  const p = profile;
  const lines = [
    `Name: ${p.name}. Role: ${p.role}. School: ${p.school}. Location: ${p.location}. Status: ${p.status}.`,
    `About: ${p.lead}`,
    'Projects:',
    ...projects.map((x) => `- ${x.title} (${x.tag}, ${x.meta}): ${x.summary}. Highlights: ${x.points.join('; ')}. Problem: ${x.problem} ${x.mechanismLabel}: ${x.mechanism}`),
    `Skills: ${toolGroups.map((g) => `${g.title}: ${g.items.join(', ')}`).join('. ')}.`,
    `Certifications: ${badges.map((b) => `${b.name} by ${b.issuer} (${b.year})`).join('; ')}.`,
    `Experience: ${experience.map((e) => `${e.title} (${e.when}): ${e.text}`).join(' | ')}`,
    `Contact: email ${p.email}, LinkedIn ${p.linkedin}, GitHub ${p.github}. ${p.availability}`,
  ];
  return lines.join('\n');
}
