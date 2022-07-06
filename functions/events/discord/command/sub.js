const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const shared = require('../../../../helpers/shared.js');
if (!context.params.event.member.permission_names.includes('ADMINISTRATOR')){
    return "";
}
let messages = await lib.discord.channels['@0.1.2'].messages.list(
  {channel_id: shared.channel});
let users = await lib.discord.guilds['@0.2.4'].members.list({
  guild_id: context.params.event.guild_id,
});
let roles = await lib.discord.guilds['@0.0.6'].roles.list({ //lists all the roles in the server
  guild_id: context.params.event.guild_id,
});
const points = shared.getPoints(messages,
  context.params.event.application_id);

const sub = context.params.event.data.options.length === 2 ? 
  context.params.event.data.options[1].value : 1;
const role = context.params.event.data.options[0].value;
if (shared.isValidRole(role) && !points.error && sub> 0){
  //Adds points and edits message
  points.points[role] = parseInt(points.points[role], 10) - sub ;
  const msg = shared.createMessage(users, roles, points.points);
  await lib.discord.channels['@0.3.2'].messages.update({
    message_id: points.messageId,
    channel_id: msg.channel_id,
    content: msg.content,
    embeds: msg.embeds
  })
}