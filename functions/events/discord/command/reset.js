const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const shared = require('../../../../helpers/shared.js');
if (!context.params.event.member.permission_names.includes('ADMINISTRATOR')){
    return "";
}
const editOldMsg = context.params.event.data.options[0].value;
let users = await lib.discord.guilds['@0.2.4'].members.list({
  guild_id: context.params.event.guild_id,
});
let roles = await lib.discord.guilds['@0.0.6'].roles.list({
  guild_id: context.params.event.guild_id,
});
let messages = await lib.discord.channels['@0.1.2'].messages.list(
  {channel_id: shared.channel});
const points = shared.getPoints(messages,
  context.params.event.application_id);
  
if (!editOldMsg || points.error) {
  //Sends new message
  await lib.discord.channels['@0.3.0'].messages.create(
  shared.createMessage(users, roles, shared.zeroPoints()));
}else{
  const msg = shared.createMessage(users, roles, shared.zeroPoints());
  await lib.discord.channels['@0.3.2'].messages.update({
    message_id: points.messageId,
    channel_id: msg.channel_id,
    content: msg.content,
    embeds: msg.embeds
  })
}