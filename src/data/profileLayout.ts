/** Presentation adapter for our locally authored profiles; never accepts remote HTML.
 * Keep editorialProfiles.json intact so public and factual-review copy stay aligned.
 */
export function profileLayout(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('[style]').forEach(node => node.removeAttribute('style'))
  const sections = Array.from(doc.body.children)
  const text = (node: Element | null) => node?.textContent?.trim() || ''
  const section = (label: string) => sections.find(node => text(node.querySelector('.eyebrow')) === label)
  const body = (label: string) => {
    const node = section(label)?.cloneNode(true) as Element | undefined
    if (!node) throw new Error(`Profile is missing ${label}`)
    const heading = text(node.querySelector('h2'))
    node.querySelector('.eyebrow')?.remove()
    node.querySelector('h2')?.remove()
    return { heading, html: node.firstElementChild?.innerHTML || '' }
  }
  const hero = doc.querySelector('.profile-hero')!
  const facts = Array.from(hero.querySelectorAll('.fact')).map(node => {
    const copy = node.cloneNode(true) as Element
    const label = text(copy.querySelector('b'))
    copy.querySelector('b')?.remove()
    return { label, value: text(copy) }
  })
  const order = ['Team', 'Leadership', 'Position', 'Bats / throws', 'Country', 'Born', 'Birthplace', 'Hometown', 'Height', 'Active']
  facts.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))
  const history = section('Documented team history')!
  const timeline = history.querySelector('table')
    ? Array.from(history.querySelectorAll('tbody tr')).map(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(text)
      return { date: cells[0], team: cells[1], detail: cells.slice(2).join(' · ') }
    })
    : Array.from(history.querySelectorAll('.history-row')).map(row => ({ date: text(row.querySelector('b')), team: text(row.querySelector('strong')), detail: text(row.querySelector('span')) }))
  const known = new Set(['Player snapshot', 'Documented team history', 'Career path', 'How she plays', 'Sources'])
  const additional = sections.filter(node => node.classList.contains('section') && !node.classList.contains('stats-section') && !known.has(text(node.querySelector('.eyebrow'))))
  return {
    art: hero.querySelector('.profile-art')!.outerHTML,
    facts,
    factNote: text(hero.querySelector('p')),
    milestones: Array.from(doc.querySelectorAll('.milestone')).map(node => {
      const copy = node.cloneNode(true) as Element
      const value = text(copy.querySelector('b')); copy.querySelector('b')?.remove()
      return { value, detail: text(copy) }
    }),
    snapshot: body('Player snapshot'), timeline,
    career: body('Career path'), playing: body('How she plays'), sources: body('Sources'),
    additional: additional.map(node => node.outerHTML).join(''),
  }
}
