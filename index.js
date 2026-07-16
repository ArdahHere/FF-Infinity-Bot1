const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

const invitesCache = new Map();


// BOT READY
client.once("clientReady", async () => {

  console.log(`Bot online: ${client.user.tag}`);


  // SAVE INVITES
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();

      invitesCache.set(
        guild.id,
        new Map(invites.map(inv => [inv.code, inv.uses]))
      );

    } catch (err) {
      console.log("Invite error:", err.message);
    }
  }


  // JOIN VOICE
  try {

    const voiceChannel = await client.channels.fetch("1526239434348040272");

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });

    console.log("Joined voice!");

  } catch (err) {
    console.log("Voice error:", err.message);
  }

});



// MEMBER JOIN
client.on("guildMemberAdd", async (member) => {

  // INVITE LOGS
  try {

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invitesCache.get(member.guild.id);

    let inviter = null;

    if (oldInvites) {

      const usedInvite = newInvites.find(inv =>
        oldInvites.get(inv.code) < inv.uses
      );

      if (usedInvite) {
        inviter = usedInvite.inviter;
      }

    }


    const inviteLog = member.guild.channels.cache.get("1527104163652046969");

    if (inviteLog) {

      if (inviter) {

        inviteLog.send(
          `📩 **${member.user.username}** joined.\n` +
          `Invited by **${inviter.username}**.`
        );

      } else {

        inviteLog.send(
          `📩 **${member.user.username}** joined.\n` +
          `I couldn't find who invited them.`
        );

      }

    }


    invitesCache.set(
      member.guild.id,
      new Map(newInvites.map(inv => [inv.code, inv.uses]))
    );


  } catch (err) {
    console.log("Invite error:", err.message);
  }



  // WELCOME
  const welcome = member.guild.channels.cache.get("1527026433455689808");

  if (welcome) {
    welcome.send(`👋 Welcome ${member} to FF Infinity! 🎉`);
  }



  // MEMBER ROLE
  try {

    const memberRole = member.guild.roles.cache.get("1527015591985152110");

    if (memberRole) {
      await member.roles.add(memberRole);
    }

  } catch (err) {
    console.log("Role error:", err.message);
  }

});



// MEMBER LEAVE
client.on("guildMemberRemove", async (member) => {

  const goodbye = member.guild.channels.cache.get("1527026412475777134");

  if (goodbye) {
    goodbye.send(`👋 Goodbye ${member.user.tag}, see you again!`);
  }

});



client.login(process.env.TOKEN);