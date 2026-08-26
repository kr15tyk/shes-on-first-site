export type FeaturedWorkStatus = 'draft' | 'factual-review' | 'ready' | 'published'

export type FeaturedWorkItem = {
  id: string
  type: 'Player Profile' | 'Data Analysis' | 'Interview'
  title: string
  dek: string
  href: string
  status: FeaturedWorkStatus
}

export const featuredWork: FeaturedWorkItem[] = [
  {
    id: 'denae-benites-flagship-profile',
    type: 'Player Profile',
    title: 'Denae Benites Found the Stage Baseball Had Denied Her',
    dek: 'The Team USA catcher spent years finding her own places to play. In the WPBL’s first game, she authored the league’s first home run.',
    href: '/features/denae-benites',
    status: 'draft',
  },
  {
    id: 'wpbl-first-month-data-story',
    type: 'Data Analysis',
    title: 'What the WPBL’s First Month Can Tell Us — and What It Cannot',
    dek: 'A transparent look at the inaugural season’s early leaders, sample sizes, transformations and unanswered questions.',
    href: '/analysis/wpbl-first-month',
    status: 'draft',
  },
]

export const publishedFeaturedWork = featuredWork.filter((item) => item.status === 'published')
