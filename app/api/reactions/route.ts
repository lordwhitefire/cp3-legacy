import {NextRequest, NextResponse} from 'next/server'
import {sanityClient} from '@/lib/sanity'
import {revalidateTag} from '@/lib/revalidate'

export async function GET() {
  const data = await sanityClient.fetch(`*[_type == "reaction" && approved == true] | order(created desc)`)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  await sanityClient.create({...body, _type: 'reaction', approved: false})
  await revalidateTag('reactions')
  return NextResponse.json({ok: true})
}