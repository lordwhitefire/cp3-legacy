export interface Reaction {
  _id: string
  source: 'twitter' | 'reddit' | 'news'
  text: string
  likes: number
  url: string
  created: string
  approved: boolean
}

export interface StatLine {
  _id: string
  season: string
  gp: number
  pts: number
  ast: number
  reb: number
  stl: number
  updated: string
}

export interface GigLead {
  _id?: string
  name: string
  email: string
  message: string
  budget: string
  contacted: boolean
}