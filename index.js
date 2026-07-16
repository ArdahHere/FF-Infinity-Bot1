const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
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

  } catch(err) {
    console.log("Voice error:", err.message);
  }



  // RULES
  const rulesChannel = client.channels.cache.get("1527006668649664694");

  if (rulesChannel) {

    const rulesEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🔥 WELCOME TO FF INFINITY 🔥")
      .setDescription(`
♾️ **The Ultimate Free Fire Community**

━━━━━━━━━━━━━━━━━━

📜 **SERVER RULES**

1️⃣ Respect Members
• احترم جميع الأعضاء.

2️⃣ No Toxicity
• ممنوع المشاكل والاستفزاز.

3️⃣ No Spam
• ممنوع السبام.

4️⃣ No Hacks / Cheats
• ممنوع الغش.

5️⃣ No Advertising
• ممنوع نشر روابط بدون إذن.

6️⃣ Voice Rules
• احترم الجميع.

7️⃣ Free Fire Rules
• العب بنزاهة.

8️⃣ Staff Rules
• احترم الإدارة.

━━━━━━━━━━━━━━━━━━

⚠️ Punishments

• Warning
• Mute
• Kick
• Ban

━━━━━━━━━━━━━━━━━━

🔥 Have Fun & Get Booyah!
`)
      .setFooter({
        text: "FF Infinity • Rules"
      });


    rulesChannel.send({
      content: "@everyone @here",
      embeds: [rulesEmbed],
      allowedMentions: {
        parse: ["everyone"]
      }
    });

  }



  // ANNOUNCEMENT
  const announceChannel = client.channels.cache.get("1527006713281249330");

  if (announceChannel) {

    const announceEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("👋 Welcome To FF Infinity 🔥")
      .setDescription(`
🎮 The Ultimate Free Fire Community

━━━━━━━━━━━━━━━━━━

• Find teammates 👫
• Play Squad & Ranked 🔥
• Join Tournaments 🏆
• Share clips 🎥
• Meet players 🌍

━━━━━━━━━━━━━━━━━━

📌 Important:

✅ Read rules
✅ Choose roles
✅ Respect everyone

━━━━━━━━━━━━━━━━━━

🏆 Events:

🔥 Tournaments
🎁 Giveaways
🎮 Custom Rooms

❤️ Thanks for joining FF Infinity
`)
      .setFooter({
        text: "FF Infinity • Community"
      });


    announceChannel.send({
      content: "@everyone @here",
      embeds: [announceEmbed],
      allowedMentions: {
        parse: ["everyone"]
      }
    });

  }

});



// MEMBER JOIN
client.on("guildMemberAdd", async (member) => {

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


    const log = member.guild.channels.cache.get("1527104163652046969");

    if (log) {

      log.send(
        inviter
        ? `📩 ${member.user.username} joined.\nInvited by ${inviter.username}`
        : `📩 ${member.user.username} joined.\nI couldn't find who invited them.`
      );

    }


  } catch(err) {
    console.log(err.message);
  }



  const welcome = member.guild.channels.cache.get("1527026433455689808");

  if (welcome) {
    welcome.send(`👋 Welcome ${member} to FF Infinity! 🎉`);
  }

});



// LEAVE
client.on("guildMemberRemove", async (member) => {

  const goodbye = member.guild.channels.cache.get("1527026412475777134");

  if (goodbye) {
    goodbye.send(`👋 Goodbye ${member.user.tag}`);
  }

});



client.login(process.env.TOKEN);