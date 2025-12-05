// lib/sanity-write.ts
import {createClient} from '@sanity/client'

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-01-01',
  useCdn: false, // Disable CDN for writes
  token: process.env.SANITY_API_WRITE_TOKEN, // 👈 WRITE token needed
})