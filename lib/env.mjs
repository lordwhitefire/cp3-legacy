const REQUIRED = ['SANITY_PROJECT_ID', 'SANITY_TOKEN']
const OPTIONAL = [
  'SANITY_API_READ_TOKEN', 'SANITY_API_WRITE_TOKEN',
  'NEXT_PUBLIC_SANITY_PROJECT_ID', 'NEXT_PUBLIC_SANITY_DATASET',
  'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'REVALIDATE_SECRET',
]

export function assertEnv() {
  for (const key of REQUIRED) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`)
    }
  }
  return true
}

export function getEnv() {
  const vars = {}
  for (const key of [...REQUIRED, ...OPTIONAL]) {
    vars[key] = process.env[key] || ''
  }
  return vars
}
