export const revalidateSecret = process.env.REVALIDATE_SECRET!

export async function revalidateTag(tag: string) {
  const res = await fetch(
    `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    }/api/revalidate?secret=${revalidateSecret}&tag=${tag}`
  )
  if (!res.ok) throw new Error('Revalidate failed')
}