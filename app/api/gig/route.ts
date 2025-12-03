import {NextRequest, NextResponse} from 'next/server'
import {sanityClient} from '@/lib/sanity'

export async function POST(req: NextRequest) {
  const body = await req.json()
  await sanityClient.create({_type: 'gigLead', ...body, contacted: false})
  return NextResponse.json({ok: true})
}