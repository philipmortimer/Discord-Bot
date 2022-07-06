//should be run hourly, but isn't to save free api calls
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const shared = require('../../../helpers/shared.js');
let messages = await lib.discord.channels['@0.1.2'].messages.list(
  {channel_id: shared.channel});
let users = await lib.discord.guilds['@0.2.4'].members.list({
  guild_id: shared.serverId,
});
let roles = await lib.discord.guilds['@0.0.6'].roles.list({
  guild_id: shared.serverId,
});
const points = shared.getPoints(messages,
  shared.applicationId);

if(!points.error){
  const msg = shared.createMessage(users, roles, points.points);
  await lib.discord.channels['@0.3.2'].messages.update({
    message_id: points.messageId,
    channel_id: msg.channel_id,
    content: msg.content,
    embeds: msg.embeds
  });
}