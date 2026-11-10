// All page content lives here. Edit this file to update the site;
// the components and Robo's AI context both read from it.
// Anything in [square brackets] is a placeholder to replace with your real info.

export const profile = {
  name: 'Steven Lim',
  initials: 'SL',
  role: 'Information Technology',
  school: 'Politeknik Caltex Riau',
  location: 'Pekanbaru, Indonesia',
  timezone: 'Asia/Jakarta',
  status: 'Open to work',
  lead: 'I build full-stack web apps with Laravel and React, backed by a solid grounding in networking.',
  leadExtra: 'Now a Technical Support Engineer at Apical, and exploring generative AI.',
  heroTags: ['Full-stack web', 'Laravel · React', 'Networking', 'Generative AI'],
  email: 'achensteven2005@gmail.com',
  linkedin: 'https://www.linkedin.com/in/steven-lim-22b6ba2b2',
  github: 'https://github.com/StevenTI1191',
  // Put your CV in /public and point to it here (replace the file to update it)
  cv: '/Steven-Lim-CV.pdf',
  languages: ['English (professional working)', 'Indonesian (native)', 'Chinese (full professional)'],
  availability: 'Open to roles in software engineering and machine learning, plus freelance web projects. I usually reply within a day.',
};

// color: 'c1' blue, 'c2' purple, 'c3' green, 'c4' orange
// mock: 'laptop' | 'phone' | 'doc' (shown inside "View details")
// screenshot: optional path in /public, e.g. '/projects/erp.png' (replaces the mock)
// stat and github are optional; leave them out to hide them
export const projects = [
  {
    id: 'laksamana-erp',
    color: 'c1',
    tag: 'Web app · ERP',
    meta: 'Jul – Aug 2026 · Laksamana Group',
    title: 'Laksamana Office',
    summary: 'An internal ERP-style system that runs day-to-day work for Laksamana Group',
    points: ['REST APIs with PHP and MySQL', 'Role-based access control', 'CI/CD deploys to cPanel hosting'],
    stat: { value: '13+', label: 'Business modules in one system' },
    problem: 'The group needed one internal system to handle work across many business areas, with data shared between them.',
    mechanismLabel: 'Mechanism',
    mechanism: 'PHP and MySQL REST APIs behind interactive frontends, role-based access control, cross-module data integration, and an automated CI/CD pipeline to cPanel shared hosting.',
    mock: 'laptop',
    screenshot: '',
    github: '',
  },
  {
    id: 'laksamana-ticketing',
    color: 'c2',
    tag: 'Event system · Team lead',
    meta: 'Jul – Oct 2025 · Laksamana Group',
    title: 'E-Ticketing and Registration',
    summary: 'Automated ticketing and seat selection for event registration',
    points: ['Automated e-ticketing workflow', 'Seat selection system', 'Led the ticketing and registration team'],
    problem: 'Event registration needed to be quicker and easier for attendees.',
    mechanismLabel: 'Mechanism',
    mechanism: 'Automated e-ticketing workflows paired with an interactive seat selection system. [Add the stack you used.]',
    mock: 'phone',
    screenshot: '',
    github: '',
  },
  {
    id: 'powerplant-inventory',
    color: 'c3',
    tag: 'Web app · Internship',
    meta: '2026 · Apical, Dumai',
    title: 'Power Plant Inventory',
    summary: '[One sentence: what this inventory system does]',
    points: ['Built during the internship at Apical', '[Key feature]', '[Key feature]'],
    problem: '[What was hard before this system existed.]',
    mechanismLabel: 'Mechanism',
    mechanism: '[Stack and how it works.]',
    mock: 'doc',
    screenshot: '',
    github: '',
  },
];

export const marquee = {
  top: ['Laravel', 'React.js', 'PHP', 'MySQL', 'REST API'],
  bottom: ['AWS', 'Generative AI', 'MikroTik', 'Cisco', 'CI/CD'],
};

// icon: 'code' | 'cloud' | 'web' | 'network' | 'globe'
export const toolGroups = [
  { title: 'Web development', icon: 'web', text: 'Full-stack apps, from database to interface.', items: ['Laravel', 'React.js', 'PHP', 'MySQL', 'REST API'] },
  { title: 'Networking', icon: 'network', text: 'Configuring and running network infrastructure.', items: ['MikroTik', 'Cisco routing', 'Switching', 'Network admin'] },
  { title: 'Cloud and AI', icon: 'cloud', text: 'Deploying apps and building with generative AI.', items: ['AWS', 'Generative AI', 'Claude', 'CI/CD'] },
  { title: 'Languages I speak', icon: 'globe', text: 'Comfortable working across three languages.', items: ['English', 'Indonesian', 'Chinese'] },
];

// category must match one of the badgeFilters ids
// image: put your badge file in /public/badges and write '/badges/your-file.png'.
//        Leave empty to show a generated placeholder shape.
// shape: 'hex' | 'circle' | 'shield' | 'diamond' (placeholder only)
export const badges = [
  { name: 'AWS SimuLearn: AI Practitioner Badge', issuer: 'Amazon Web Services (AWS)', year: 'Nov 2026', category: 'cloud', link: '', image: '', shape: 'hex', color: '#EA580C', short: 'AWS' },
  { name: 'Oracle Agentic AI Foundation Associate', issuer: 'Oracle', year: 'Oct 2026 · valid until Oct 2028', category: 'ai', link: '', image: '', shape: 'circle', color: '#C2410C', short: 'OCI AI' },
  { name: 'CCNA: Switching, Routing, and Wireless Essentials', issuer: 'Cisco Networking Academy', year: '[Year]', category: 'network', link: '', image: '', shape: 'hex', color: '#2563EB', short: 'CCNA' },
  { name: 'MikroTik Certified Network Associate', issuer: 'MikroTik', year: '[Year]', category: 'network', link: '', image: '', shape: 'diamond', color: '#16A34A', short: 'MTCNA' },
  { name: 'Junior Network Administrator', issuer: '[Issuer]', year: '[Year]', category: 'network', link: '', image: '', shape: 'shield', color: '#0F766E', short: 'JNA' },
  { name: 'Ethical Hacking Essentials (EHE)', issuer: 'EC-Council', year: '[Year]', category: 'security', link: '', image: '', shape: 'shield', color: '#DC2626', short: 'EHE' },
  { name: 'Claude Academy: Claude 101', issuer: 'Anthropic', year: '[Year]', category: 'ai', link: '', image: '', shape: 'circle', color: '#7C3AED', short: 'AI 101' },
];

export const badgeFilters = [
  { id: 'all', label: 'All' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'network', label: 'Networking' },
  { id: 'security', label: 'Security' },
  { id: 'ai', label: 'AI' },
];

export const experience = [
  { now: true, when: 'Oct 2026 – present', title: 'Technical Support Engineer · Apical', text: 'Kota Dumai, Riau. [Add your main responsibility.]' },
  { when: 'Sep – Oct 2026', title: 'Automation Engineer · Apical', text: 'Learned Hollysys DCS operations at the power plant by observing experienced engineers.' },
  { when: 'Jul – Aug 2026', title: 'Web Application Developer · Laksamana Group', text: 'Built an internal ERP-style system with 13+ business modules, REST APIs in PHP and MySQL, role-based access control, and CI/CD deployment.' },
  { when: 'Jul – Oct 2025', title: 'Ticketing & Registration System Lead · Laksamana Group', text: 'Developed automated e-ticketing workflows and a seat selection system.' },
  { when: '2023 – 2027', title: 'Student · Politeknik Caltex Riau', text: 'Bachelor of Applied Science, Information Technology.' },
];

// Robo: quick questions and the offline answers used when the AI is unavailable
export const robo = {
  greeting: "Hi! I'm Robo, Steven's assistant. Ask me anything about him.",
  intro: 'Hello! This is Steven Lim, an Information Technology student at Politeknik Caltex Riau. He builds full-stack web apps with Laravel and React, and he knows networking too. Scroll down to see his work.',
  poke: "Hey, that tickles! I'm Robo, Steven's assistant. Nice to meet you!",
  quick: [
    { q: 'What does Steven do?', a: 'Steven is an Information Technology student at Politeknik Caltex Riau and a Technical Support Engineer at Apical. Before that, he built web systems for Laksamana Group.' },
    { q: 'Tell me about his projects', a: 'He built an internal ERP-style system with 13 plus business modules and an e-ticketing system with seat selection for Laksamana Group, plus an inventory web app at Apical.' },
    { q: 'What are his skills?', a: 'Laravel, React, PHP, MySQL and REST APIs for the web, networking with MikroTik and Cisco, and AWS and generative AI.' },
    { q: 'How can I contact him?', a: 'Email him at achensteven2005@gmail.com, or reach him on LinkedIn. The contact section has both.' },
    { q: 'What languages does he speak?', a: 'Steven speaks English, Indonesian, and Chinese.' },
    { q: 'Any certifications?', a: 'Yes. He holds the AWS SimuLearn AI Practitioner badge, Oracle Agentic AI Foundation Associate, CCNA, MikroTik MTCNA, Ethical Hacking Essentials, and more on the badge shelf.' },
  ],
  fallback: "I can't reach my AI brain right now, but you can tap one of the quick questions, or check the sections below.",
};

// Plain-text summary used as the AI's knowledge (built from the data above)
export function buildKnowledge() {
  const p = profile;
  const lines = [
    `Name: ${p.name}. Studying ${p.role} at ${p.school}. Location: ${p.location}. Status: ${p.status}.`,
    `About: ${p.lead} ${p.leadExtra}`,
    `Spoken languages: ${p.languages.join(', ')}.`,
    'Projects:',
    ...projects.map((x) => `- ${x.title} (${x.tag}, ${x.meta}): ${x.summary}. Highlights: ${x.points.join('; ')}.${x.stat ? ` ${x.stat.value} ${x.stat.label}.` : ''} Problem: ${x.problem} ${x.mechanismLabel}: ${x.mechanism}`),
    `Skills: ${toolGroups.map((g) => `${g.title}: ${g.items.join(', ')}`).join('. ')}.`,
    `Certifications: ${badges.map((b) => `${b.name} from ${b.issuer}${b.year && !b.year.startsWith('[') ? ` (${b.year})` : ''}`).join('; ')}.`,
    `Experience: ${experience.map((e) => `${e.title} (${e.when}): ${e.text}`).join(' | ')}`,
    `Contact: email ${p.email}, LinkedIn ${p.linkedin}, GitHub ${p.github}. ${p.availability}`,
  ];
  return lines.join('\n');
}
