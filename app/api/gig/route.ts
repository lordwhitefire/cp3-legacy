// /api/gig/route.ts
import {NextRequest, NextResponse} from 'next/server'
import {writeClient} from '@/lib/sanity-write'
import twilio from 'twilio'

// Your Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN // Store token in env
const client = twilio(accountSid, authToken)
const fromNumber = 'whatsapp:+14155238886'
const toNumber = 'whatsapp:+2348146927170'

async function sendWhatsAppNotification(lead: any) {
  try {
    // Create a dynamic message with lead details
    const message = await client.messages.create({
      from: fromNumber,
      body: `🎯 NEW GIG LEAD!\n\n👤 Name: ${lead.name}\n📧 Email: ${lead.email}\n💰 Budget: ${lead.budget}\n📝 Message: ${lead.message || 'No additional message'}\n\n⏰ Received: ${new Date().toLocaleString()}`,
      to: toNumber
    })
    
    console.log('✅ WhatsApp notification sent:', message.sid)
    return message.sid
  } catch (error: any) {
    console.error('❌ WhatsApp notification failed:', error.message)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('📥 Received gig lead:', body)
    
    // Validate required fields
    if (!body.name || !body.email) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        {error: 'Name and email are required'}, 
        {status: 400}
      )
    }
    
    // Save to Sanity
    console.log('💾 Saving to Sanity...')
    const result = await writeClient.create({
      _type: 'gigLead',
      name: body.name,
      email: body.email,
      message: body.message || '',
      budget: body.budget || '< $1k',
      contacted: false,
      createdAt: new Date().toISOString()
    })
    
    console.log('✅ Saved to Sanity with ID:', result._id)
    
    // Send WhatsApp notification (fire and forget - don't await)
    console.log('📱 Sending WhatsApp notification...')
    sendWhatsAppNotification(body)
      .then(sid => {
        if (sid) {
          console.log('✅ WhatsApp sent successfully')
          // Optional: Update Sanity document with WhatsApp status
          writeClient
            .patch(result._id)
            .set({whatsappNotified: true, whatsappSid: sid})
            .commit()
            .catch(e => console.error('Failed to update WhatsApp status:', e))
        }
      })
      .catch(e => console.error('WhatsApp failed:', e))
    
    return NextResponse.json({
      ok: true,
      id: result._id,
      message: 'Lead submitted successfully'
    })
    
  } catch (error: any) {
    console.error('💥 Error in /api/gig:', error.message)
    
    return NextResponse.json(
      { 
        ok: false,
        error: 'Failed to process your request',
        details: error.message
      }, 
      {status: 500}
    )
  }
}