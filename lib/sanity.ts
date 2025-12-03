import {createClient} from '@sanity/client'
import groq from 'groq'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2023-01-01',
  useCdn: true,
  token: process.env.SANITY_API_READ_TOKEN,
})

export const queries = {
  approvedReactions: groq`*[_type == "reaction" && approved == true] | order(created desc)`,
  statLines: groq`*[_type == "statLine"] | order(season desc)`,
}