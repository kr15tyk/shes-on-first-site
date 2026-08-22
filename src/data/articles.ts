export type Article = {
  slug: string
  title: string
  dek: string
  category: 'News' | 'Features' | 'Analysis' | 'Interviews' | 'Opinion'
  author: string
  date: string
  readMins: number
  hero: string
  featured?: boolean
  body: string[]
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
      'The Inaugural 60 is a working reconstruction of the players reported across the four 15-player opening-day WPBL rosters. The cohort remains provisional until an authoritative league roster can be obtained and checked.',
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
      'Conflicting facts are recorded rather than blended together. Fast-changing statistics keep a through-date. First-person interviews can add voice and context, but they do not replace independent reporting when a claim needs independent support.',
      'A profile moves toward publication only after its claims and sources have been reviewed. Missing information stays missing until it can be supported.',
    ],
  },
  {
    slug: 'why-image-rights-matter',
    title: 'Why Image Rights Matter',
    dek: 'A photograph being online does not make it free to reuse.',
    category: 'Analysis',
    author: "She's On First",
    date: '2026-08-22',
    readMins: 3,
    hero: 'e',
    body: [
      'She’s On First uses player photography only when the intended use is documented. That means identifying the photographer or rightsholder, the license or permission, the required attribution, and the places where the image may appear.',
      'Permission for a project website or social post is different from a license suitable for Wikimedia Commons. Commons requires a free license that allows redistribution, commercial reuse, and modification.',
      'Until those rights are clear, a profile may use an original graphic treatment or no player image at all. Respecting the work of photographers is part of building a trustworthy archive.',
    ],
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
