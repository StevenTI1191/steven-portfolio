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
// stat, stack, github and demo are optional; leave them out to hide them
export const projects = [
  {
    id: 'event-management',
    color: 'c1',
    tag: 'Final project · Web app',
    meta: 'Dec 2025 – Jul 2026 · PT Laksamana Muda Bersatu',
    title: 'Event Management System',
    summary: 'One automated flow for an event organizer, from first prospect to finished event',
    points: [
      'Kanban sales pipeline, from lead to done',
      'OCR checks payment proofs for the finance team',
      'Detects schedule conflicts, including setup and teardown',
      'Auto invoices, to-do lists, and performance metrics',
    ],
    stat: { value: 'Live', label: "Passed UAT and runs in the company's daily operations" },
    stack: ['Laravel', 'React.js', 'MySQL', 'OCR'],
    github: 'https://github.com/StevenTI1191/EventSystem-LaksamanaMuda',
  },
  {
    id: 'mbg-sentiment',
    color: 'c2',
    tag: 'NLP · Machine learning',
    meta: 'Apr – Jun 2026',
    title: 'MBG Sentiment Analysis with IndoBERT',
    summary: "Public sentiment toward Indonesia's Free Nutritious Meals program (Makan Bergizi Gratis)",
    points: ['End-to-end NLP pipeline', 'Fine-tuned IndoBERT model', 'Interactive website to explore the results'],
    stack: ['IndoBERT', 'NLP', 'Fine-tuning'],
  },
  {
    id: 'ecoscore',
    color: 'c3',
    tag: 'GIS · Web app',
    meta: 'Oct 2025 – Jan 2026 · Team project',
    title: 'EcoScore',
    summary: 'A geographic information system that maps how clean each region is',
    points: ['Map-based view of regional cleanliness', 'Charts that compare regions at a glance', 'Built with React.js'],
    stack: ['React.js', 'GIS'],
  },
  {
    id: 'eventsight',
    color: 'c4',
    tag: 'Android · Machine learning',
    meta: 'Oct 2025 – Jan 2026 · Team project',
    title: 'EventSight',
    summary: 'A native Android app that manages the full event lifecycle',
    points: ['Native Android app in Kotlin', 'Machine learning built into the app', 'Covers events from planning to wrap-up'],
    stack: ['Kotlin', 'Android', 'Machine learning'],
  },
  {
    id: 'nextgen-books',
    color: 'c1',
    tag: 'Web app',
    meta: 'Oct – Dec 2025',
    title: 'NextGen Book Request System',
    summary: 'A system for submitting and managing book requests',
    points: ['Laravel backend logic', 'Responsive interface with Bootstrap', 'Book requests managed in one place'],
    stack: ['Laravel', 'Bootstrap'],
    github: 'https://github.com/StevenTI1191/Sistem_Request_Kebutuhan_Buku',
  },
  {
    id: 'klikapotek',
    color: 'c2',
    tag: 'E-commerce · Web app',
    meta: 'Feb – Jul 2025',
    title: 'KlikApotek',
    summary: 'A web-based pharmacy e-commerce platform',
    points: ['Full-stack app for pharmaceutical products', 'React.js frontend with Supabase', 'Core shopping flow over REST APIs'],
    stack: ['React.js', 'Supabase', 'REST API'],
    github: 'https://github.com/StevenTI1191/KlikApotek',
    demo: 'https://klik-apotek.vercel.app',
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
  { name: 'AWS SimuLearn: AI Practitioner', issuer: 'Amazon Web Services (AWS)', year: 'Nov 2026', category: 'cloud', link: '', image: '/badges/aws-simulearn-ai-practitioner.png', shape: 'hex', color: '#EA580C', short: 'AWS' },
  { name: 'AWS Cloud Quest: Generative AI Architect', issuer: 'Amazon Web Services (AWS)', year: '[Year]', category: 'cloud', link: '', image: '/badges/aws-cloud-quest-genai-architect.png', shape: 'hex', color: '#92400E', short: 'AWS' },
  { name: 'Oracle Certified Foundations Associate: Agentic AI', issuer: 'Oracle', year: 'Oct 2026 · valid until Oct 2028', category: 'ai', link: '', image: '/badges/oracle-agentic-ai-foundations.png', shape: 'circle', color: '#C2410C', short: 'OCI AI' },
  { name: 'Claude Academy: Claude 101', issuer: 'Anthropic', year: 'Oct 2026', category: 'ai', link: '', image: '', logo: '/logos/anthropic.png', shape: 'circle', color: '#7C3AED', short: 'AI 101' },
  { name: 'Technical Support Fundamentals', issuer: 'Google', year: 'May 2026', category: 'other', link: '', image: '', logo: '/logos/google.png', shape: 'circle', color: '#4285F4', short: 'G' },
  { name: 'Ethical Hacking Essentials (EHE)', issuer: 'EC-Council', year: '[Year]', category: 'security', link: '', image: '/badges/ec-council-ehe.png', shape: 'shield', color: '#DC2626', short: 'EHE' },
  { name: 'CCNA: Switching, Routing, and Wireless Essentials', issuer: 'Cisco Networking Academy', year: '[Year]', category: 'network', link: '', image: '', shape: 'hex', color: '#2563EB', short: 'CCNA' },
  { name: 'MikroTik Certified Network Associate', issuer: 'MikroTik', year: '[Year]', category: 'network', link: '', image: '', logo: '/logos/mikrotik.png', shape: 'diamond', color: '#16A34A', short: 'MTCNA' },
  { name: 'Junior Network Administrator', issuer: 'BNSP', year: '[Year]', category: 'network', link: '', image: '', logo: '/logos/bnsp.png', shape: 'shield', color: '#0F766E', short: 'JNA' },
];

export const badgeFilters = [
  { id: 'all', label: 'All' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'ai', label: 'AI' },
  { id: 'network', label: 'Networking' },
  { id: 'security', label: 'Security' },
  { id: 'other', label: 'Other' },
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
    { q: 'Tell me about his projects', a: 'His final project is an event management system now used by PT Laksamana Muda Bersatu, with a sales pipeline, OCR payment checks, and conflict detection. He also built an IndoBERT sentiment analysis, the EcoScore map app, the EventSight Android app, and the KlikApotek pharmacy store.' },
    { q: 'What are his skills?', a: 'Laravel, React, PHP, MySQL and REST APIs for the web, networking with MikroTik and Cisco, and AWS and generative AI.' },
    { q: 'How can I contact him?', a: 'Email him at achensteven2005@gmail.com, or reach him on LinkedIn. The contact section has both.' },
    { q: 'What languages does he speak?', a: 'Steven speaks English, Indonesian, and Chinese.' },
    { q: 'Any certifications?', a: 'Yes. Highlights include the AWS SimuLearn AI Practitioner badge, Oracle Agentic AI Foundations Associate, and EC-Council Ethical Hacking Essentials, plus CCNA, MikroTik MTCNA, Google Technical Support Fundamentals, and Claude 101.' },
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
    ...projects.map((x) => `- ${x.title} (${x.tag}, ${x.meta}): ${x.summary}. Highlights: ${x.points.join('; ')}.${x.stat ? ` ${x.stat.value}: ${x.stat.label}.` : ''}${x.stack ? ` Built with ${x.stack.join(', ')}.` : ''}${x.demo ? ` Live demo: ${x.demo}.` : ''}`),
    `Skills: ${toolGroups.map((g) => `${g.title}: ${g.items.join(', ')}`).join('. ')}.`,
    `Certifications: ${badges.map((b) => `${b.name} from ${b.issuer}${b.year && !b.year.startsWith('[') ? ` (${b.year})` : ''}`).join('; ')}.`,
    `Experience: ${experience.map((e) => `${e.title} (${e.when}): ${e.text}`).join(' | ')}`,
    `Contact: email ${p.email}, LinkedIn ${p.linkedin}, GitHub ${p.github}. ${p.availability}`,
  ];
  return lines.join('\n');
}
