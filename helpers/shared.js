const serverId = '754714385250779256';
const channel = '992064105345187860';
const applicationId = '992019221674467339';

//List of roles to be displayed
//Amounts to ['Green', 'Red', 'Blue'] in practice
const rolesRequired = ['992071016799019088', '992109852090454016',
'992109886114648175'];

module.exports = {createMessage, channel, isValidRoleDescription, getRoleId,
 zeroPoints, isValidRole, getPoints, serverId, applicationId };

//Checks to see if id is one of roles
function isValidRole (id) { return rolesRequired.includes(id); }

//Gets the points for each player by attempting to find most recent message
// If no valid message can be found, an error flag is set
function getPoints (messages, botId) {
  //Gets most recent bot message
  let messId = null;
  let recentMess = getMostRecentBotMessage(messages,
    botId);
  let error = !recentMess.foundMessage;
  let points = null;
  if (recentMess.foundMessage) {
    messId = recentMess.message.id;
    points = getPointsFromMessage(recentMess.message);
    error = error || points.invalidMessage
  }
  if (error){ return {error: true, points: [], messageId: ""};}
  return {error: error, points: points.points, messageId: messId};
}

// Gets the points that each team member has from the provided message.
// If points can't be calculated (e.g. because message format is unexpected)
// a flag is set to indicate that the message provided is invalid
function getPointsFromMessage (message) {
  let points = {};
  //Performs basic validation to ensure that message has embeds and that
  //each embed contains a points field with a valid value
  let valid = message.hasOwnProperty('embeds') && Array.isArray(message.embeds);
  if (valid){
    for (let i = 0; (i < message.embeds.length) && valid; i++){
      if (message.embeds[i].hasOwnProperty('fields') && 
      Array.isArray(message.embeds[i].fields) && 
      message.embeds[i].hasOwnProperty('description')
      && isValidRoleDescription(message.embeds[i].description)){
        //Checks to see if 'Points' is included in fields
        let foundPoints = false;
        for (const field of message.embeds[i].fields) {
          if (field.hasOwnProperty('name') && field.name === 'Points' && 
          field.hasOwnProperty('value') && 
          Number.isInteger(Number(field.value))){
            points[getRoleId(message.embeds[i].description)] = 
              field.value; 
            foundPoints = true;
            break;
          }
        }
        valid = valid && foundPoints;
      }else{ valid = false; }
    }
  }
  return {invalidMessage: !valid, points: points};
}

// Gets most recent message from bot. If no message exist, flag will be 
// set to indicate this
function getMostRecentBotMessage (messages, botId) {
  //I believe collection sorts by timestamp anyway. But i don't see this
  //explicitly guaranteed in API docs (it may actually be there)
  //so array is sorted by timestamp just to be safe.
  messages.sort((x, y) => 
    x.timestamp === y.timestamp ? 0 : 
    new Date(x.timestamp) < new Date(y.timestamp) ? 1 : -1);
  let botMessage = "";
  for (let i = 0; i < messages.length; i++) {
    //Checks to see if message is sent by bot
    if(messages[i].author.id === botId){
      botMessage = messages[i]; break;
    }
  }
  return {foundMessage: botMessage !== "", message: botMessage};
}

//Returns object which represents each role having zero points
function zeroPoints () {
  let points = {};
  for (const role of rolesRequired) {
    points[role] = '0';
  }
  return points;
}

//Gets role ID from formatted role ID. E.g.
// '<@&12345>' => '12345'
//Calle is responsible for ensuring input is valid
function getRoleId (des) {
  return des.slice(3, des.length - 1);
}

//Checks to see whether string provided is one of the roles used
//by bot with "<@&" at start and ">" at end
function isValidRoleDescription (des) {
  if (des.length <= 3) { return false; }
  if (des[0] !=='<' || des[1] !== '@' || 
    des[2] !== '&' || des[des.length - 1] !== '>'){ 
    return false; 
  }
  const id = getRoleId(des);
  if (!rolesRequired.includes(id)) { return false; }
  return true;
}

//Creates a message object listing all members.
function createMessage (users, roles, points) {

  let rolesSelected= []; //Stores all roles needed
  
  
  //Incase of two rules with same name, but different ID's, they
  // are treated as two seperate roles
  for (const role of roles) {
    if(rolesRequired.includes(role.id)) 
      rolesSelected.push(role);
  }
  
  //Loads data into embed array
  let embeds = []; //Stores all the embeds in an array
  for (const role of rolesSelected) {
    const usersWithRole = users.filter(x => x.roles.includes(role.id));
    let userAts = '';
    for(const userId of usersWithRole) {
      userAts += '<@' + userId.user.id + '> ';
    }
    embeds.push(createEmbed(role, userAts, points[role.id]));
  }
  
  //Sorts embeds in point order
  embeds.sort((x, y) => y.fields[1].value - x.fields[1].value);
  
  //Adds sign to display ranking on leaderboard
  let previousVal = Infinity;
  let currentRank = 0;
  for (let i = 0; i < embeds.length; i++) {
    if(embeds[i].fields[1].value !== previousVal){
      currentRank++;
      previousVal = embeds[i].fields[1].value;
    } 
    embeds[i].title += " #" + currentRank ;
  }
  
  //Returns message object
  return ({
    "channel_id": channel,
    "content": "<t:" + Math.round((new Date()).getTime() / 1000) + ":R>",
    "tts": false,
    "embeds": embeds
  });
}

//Creates the embed in the required format
function createEmbed(role, members, points) {
  //Value field can't be left empty
  members = members === '' ? '-' : members;
  return (
    {
      "type": "rich",
      "title": role.name,
      "description": '<@&' + role.id+ '>',
      "color": role.color,
      "fields": [
        {
          "name": `Members`,
          "value": members,
          "inline": true
        },
        {
          "name": `Points`,
          "value": points,
          "inline": true
        }
      ]
    }
  );
}