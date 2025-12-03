import {NextRequest, NextResponse} from 'next/server'
import {revalidateTag} from '@/lib/revalidate'
import {revalidateSecret} from '@/lib/revalidate'

export async function POST(req: NextRequest) {
  const {searchParams} = new URL(req.url)
  if (searchParams.get('secret') !== revalidateSecret)
    return NextResponse.json({message: 'Invalid secret'}, {status: 401})

  revalidateTag('stats')
  return NextResponse.json({revalidated: true})
}