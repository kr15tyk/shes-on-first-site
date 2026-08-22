export type Article = {
  slug: string
  title: string
  dek: string
  category: 'News' | 'Features' | 'Analysis' | 'Interviews' | 'Opinion' | 'Contact'
  author: string
  date: string
  readMins: number
  hero: string
  featured?: boolean
  body: string[]
  contactEmail?: string
}

export const articles: Article[] = [
  {
    slug: 'building-the-inaugural-60',
    title: 'Building the Inaugural 60',
    dek: 'Why the project begins with a provisional roster, a source trail, and room for correction.',
    category: 'Features',
    author: "She's On First",
    date: '2026-08-22',
    readMins: 3,
    hero: 'a',
    featured: true,
    body: [
      'The Inaugural 60 is a working reconstruction of the players reported across the four 15-player opening-day WPBL rosters.',
      'Each roster slot keeps its own status. Names, spellings, positions, and team assignments can be corrected without silently rewriting the record. Later additions or replacements will be documented without changing the historical question the project is trying to answer: who was there at the beginning?',
      'The goal is a durable starting point for fans and researchers, not a claim that the work is finished. Visible uncertainty is part of the record.',
    ],
  },
  {
    slug: 'how-we-source-player-profiles',
    title: 'How We Source a Player Profile',
    dek: 'A public profile should make its evidence, uncertainty, and editorial status visible.',
    category: 'Analysis',
    author: "She's On First",
    date: '2026-08-22',
    readMins: 4,
    hero: 'b',
    featured: true,
    body: [
      'Every profile begins with a structured factual record covering identity, team, position, career history, achievements, and available statistics. Reliable independent reporting is distinguished from league, team, governing-body, player, and project sources.',
      'Fast-changing statistics keep a through-date. First-person interviews can add voice and context, but they do not replace independent reporting when a claim needs independent support.',
      'A profile moves toward publication only after its claims and sources have been reviewed. Missing information stays missing until it can be supported.',
    ],
  },
  {
    slug: 'why-image-rights-matter',
    title: 'For Photographers & Journalists',
    dek: 'Covering women’s baseball or interested in contributing photography? We’d like to hear from you.',
    category: 'Contact',
    author: "She's On First",
    date: '2026-08-22',
    readMins: 2,
    hero: 'e',
    body: [
      'She’s On First is building an independent, sourced record of the people shaping women’s baseball. Strong photography and thoughtful reporting are essential to telling that story well.',
      'Photographers can contact us about contributing original work, licensing existing images, attribution and usage terms, or collaborating on player and event coverage.',
      'Journalists can reach out with reporting leads, interview opportunities, corrections, media inquiries, or ideas for collaboration.',
      'Please include your name, outlet or portfolio link, what you’re working on, and any relevant deadline. We’ll respond as soon as we can.',
    ],
    contactEmail: 'info@shesonfirst.com',
  },
]

export const heroGradients: Record<string, string> = {
  a: 'linear-gradient(135deg, #6e5ce6, #35d6c0)',
  b: 'linear-gradient(135deg, #241553, #8b7cf2)',
  c: 'linear-gradient(135deg, #101e58, #35d6c0)',
  d: 'linear-gradient(135deg, #8b7cf2, #1c1044)',
  e: 'linear-gradient(135deg, #35d6c0, #6e5ce6)',
  f: 'linear-gradient(135deg, #2c1a63, #67e7c8)',
}

export const getArticle = (slug: string) => articles.find((article) => article.slug === slug)
