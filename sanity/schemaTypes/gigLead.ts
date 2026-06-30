export default {
  name: 'gigLead',
  type: 'document',
  title: 'Gig Lead',
  fields: [
    {name: 'name', type: 'string', title: 'Name'},
    {name: 'email', type: 'string', title: 'Email', validation: (Rule: any) => Rule.email()},
    {name: 'message', type: 'text', title: 'Message'},
    {name: 'budget', type: 'string', title: 'Budget Range', options: {list: ['< $100', '$100-500', '$500-1k', '$1k+']}},
    {
      name: 'contacted', 
      type: 'boolean', 
      title: 'Contacted?', 
      initialValue: false
    },
    {
      name: 'whatsappNotified',
      type: 'boolean',
      title: 'WhatsApp Notified?',
      initialValue: false,
      description: 'Whether a WhatsApp notification was sent'
    },
    {
      name: 'whatsappSid',
      type: 'string',
      title: 'WhatsApp Message SID',
      description: 'Twilio message SID for tracking'
    },
    {
      name: 'createdAt',
      type: 'datetime',
      title: 'Created At',
      initialValue: (new Date()).toISOString()
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email'
    }
  },
  orderings: [
    {
      title: 'Created At, New',
      name: 'createdAtDesc',
      by: [
        {field: 'createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Created At, Old',
      name: 'createdAtAsc',
      by: [
        {field: 'createdAt', direction: 'asc'}
      ]
    }
  ]
}