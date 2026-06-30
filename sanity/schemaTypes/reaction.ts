export default {
  name: 'reaction',
  type: 'document',
  title: 'Reaction',
  fields: [
    {name: 'source', type: 'string', title: 'Source', options: {list: [{title: 'Twitter', value: 'twitter'}, {title: 'Reddit', value: 'reddit'}, {title: 'News', value: 'news'}]}},
    {name: 'text', type: 'text', title: 'Text', validation: (Rule: any) => Rule.max(280)},
    {name: 'likes', type: 'number', title: 'Likes', initialValue: 0},
    {name: 'url', type: 'url', title: 'URL'},
    {name: 'created', type: 'datetime', title: 'Created'},
    {name: 'approved', type: 'boolean', title: 'Approved', initialValue: false},
  ],
  preview: {select: {title: 'text', subtitle: 'source'}},
}