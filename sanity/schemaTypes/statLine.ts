export default {
  name: 'statLine',
  type: 'document',
  title: 'Season Stat Line',
  fields: [
    {name: 'season', type: 'string', title: 'Season'},
    {name: 'gp', type: 'number', title: 'Games Played'},
    {name: 'pts', type: 'number', title: 'Points'},
    {name: 'ast', type: 'number', title: 'Assists'},
    {name: 'reb', type: 'number', title: 'Rebounds'},
    {name: 'stl', type: 'number', title: 'Steals'},
    {name: 'updated', type: 'datetime', title: 'Updated'},
  ],
  preview: {select: {title: 'season', subtitle: 'updated'}},
}