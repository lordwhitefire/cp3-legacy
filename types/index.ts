export interface Reaction {
  _id: string
  source: 'twitter' | 'reddit' | 'news'
  title?: string
  text: string
  likes: number
  url: string
  imageUrl?: string
  sourceName?: string
  author?: string
  created: string
  approved: boolean
}

export interface StatLine {
  _id: string
  season: string
  team: string
  gp: number
  pts: number
  ast: number
  reb: number
  stl: number
  blk: number
  fg_pct: number
  fg3_pct: number
  ft_pct: number
  mp: number
  tov: number
  pf: number
  orb: number
  drb: number
  fg: number
  fga: number
  fg3: number
  fg3a: number
  ft: number
  fta: number
  efg_pct: number
}

export interface GigLead {
  _id?: string
  name: string
  email: string
  message: string
  budget: string
  contacted: boolean
}