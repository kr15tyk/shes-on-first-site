export type PlayerLinks = {
  wikipedia?: string
  wpbl?: string
  usaBaseball?: string
  baseballRef?: string
  instagram?: string
  tiktok?: string
  x?: string
  youtube?: string
  website?: string
}

export type Player = {
  number: number
  slug: string
  name: string
  team: string
  position: string
  bats?: string
  throws?: string
  hometown?: string
  bio?: string[]
  quote?: string
  hero: string
  published: boolean
  links?: PlayerLinks
}

type RosterGroup = {
  team: string
  players: Array<[name: string, position: string]>
}

// Working reconstruction of the four 15-player opening-day rosters. The cohort
// remains provisional until an authoritative league roster is obtained.
const rosterGroups: RosterGroup[] = [
  {
    team: 'Boston Hunters',
    players: [
      ['Hyeonah Kim', 'C'],
      ['Alli Schroder', 'P'],
      ['Raine Padgham', 'P'],
      ['Lexi Hastings', 'LF'],
      ['Kate Blunt', 'SS'],
      ['Denver Bryant', '2B'],
      ['Ticara Geldenhuis', 'OF'],
      ['Suzuka Yamamoto', 'SS'],
      ['Maïka Dumais', 'P'],
      ['Gigi Schiano', 'P'],
      ['Maria Jose Valenzuela', 'IF'],
      ['Molly Paddison', 'CF'],
      ['Beth Greenwood', 'C'],
      ['Sabrina Robinson', '1B'],
      ['Gabriella Haas', 'SS'],
    ],
  },
  {
    team: 'Los Angeles Queens',
    players: [
      ['Ayami Sato', 'P'],
      ['Ashton Lansdell', '3B'],
      ["Mo'ne Davis", 'CF'],
      ['Meggie Meidlinger', 'P'],
      ['Thaima Maximiliana', 'SS'],
      ['Jamie Mackay', 'C'],
      ['Emi Saiki', 'SS'],
      ['Samaria Benítez', 'SS'],
      ['Maggie Foxx', 'C'],
      ['Michelle Roche', 'P'],
      ['Suzu Narasaki', 'CF'],
      ['Caitlin Eynon', 'SS'],
      ['Sarah Edwards', '1B'],
      ['Brittany Apgar', 'CF'],
      ['Leah Cornish', 'C'],
    ],
  },
  {
    team: 'New York Heights',
    players: [
      ['Kylee Lahners', '3B'],
      ['Denae Benites', 'C'],
      ['Rakyung Kim', 'P'],
      ['Valerie Perez', 'SS'],
      ['Jaida Lee', 'P'],
      ['London Studer', '1B'],
      ['Keira Izumi', 'SS'],
      ['Natsuki Yonetani', 'LF'],
      ['Alyssa Zettlemoyer', 'C'],
      ['Madison Willan', 'IF'],
      ['Claire Eccles', 'CF/P'],
      ['Elodie Ciamarro', 'C'],
      ['Jacqui Reynolds', 'P'],
      ['Diana Ibarra', 'CF'],
      ["Claire O'Sullivan", 'P'],
    ],
  },
  {
    team: 'San Francisco Firebells',
    players: [
      ['Kelsie Whitmore', 'P/OF'],
      ['Amanda Gianelloni', '2B'],
      ['Joely Leguizamon', 'SS'],
      ['Jill Albayati', 'P/UTL'],
      ['Samantha Gutierrez', 'C'],
      ['Ayaka Yamamoto', '3B'],
      ['Niki Eckert', 'P'],
      ['Andréanne Leblanc', '1B'],
      ['Jua Park', 'SS'],
      ['Alexia Jorge', 'C'],
      ['Ela Day-Bédard', 'IF'],
      ['Rosi del Castillo', 'CF'],
      ['Liz Gilder', 'P'],
      ['Skylar Kaplan', 'LF'],
      ['Hinano Beppu', '2B'],
    ],
  },
]

const slugify = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const allPlayers: Player[] = rosterGroups.flatMap((group, groupIndex) =>
  group.players.map(([name, position], playerIndex) => {
    const number = groupIndex * 15 + playerIndex + 1
    return {
      number,
      slug: slugify(name),
      name,
      team: group.team,
      position,
      hero: ['a', 'b', 'c', 'd', 'e', 'f'][(number - 1) % 6],
      published: false,
    }
  }),
)

export const publishedPlayers = allPlayers.filter((player) => player.published)
export const getPlayer = (slug: string) => allPlayers.find((player) => player.slug === slug)

export const playerHero: Record<string, string> = {
  a: 'linear-gradient(150deg, #6e5ce6, #35d6c0)',
  b: 'linear-gradient(150deg, #241553, #8b7cf2)',
  c: 'linear-gradient(150deg, #101e58, #35d6c0)',
  d: 'linear-gradient(150deg, #8b7cf2, #1c1044)',
  e: 'linear-gradient(150deg, #35d6c0, #6e5ce6)',
  f: 'linear-gradient(150deg, #2c1a63, #67e7c8)',
}

export const linkMeta: Record<keyof PlayerLinks, { label: string; short: string }> = {
  wikipedia: { label: 'Wikipedia', short: 'W' },
  wpbl: { label: 'WPBL', short: 'PB' },
  usaBaseball: { label: 'USA Baseball', short: 'USA' },
  baseballRef: { label: 'Baseball-Reference', short: 'BR' },
  instagram: { label: 'Instagram', short: 'IG' },
  tiktok: { label: 'TikTok', short: 'TT' },
  x: { label: 'X', short: 'X' },
  youtube: { label: 'YouTube', short: 'YT' },
  website: { label: 'Website', short: '↗' },
}
