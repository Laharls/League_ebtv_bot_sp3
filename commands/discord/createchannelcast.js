const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionsBitField } = require('discord.js');
const { embedBuilder } = require("./../../utils/embedBuilder");
const { formatingString, checkDivPickBan, checkCastTime } = require("./../../utils/utilityTools");
const { fetchUniqueMatch } = require("./../../utils/matchUtils");
const { fetchUniqueGroup } = require('../../utils/groupUtils');
const { setStreamMatch } = require("./../../utils/toornamentUtils")

const streamManager = require("./../../utils/streamManager")
const STREAM_IDS = require("./../../data/streamer_ids.json")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creerchannelcast')
        .setDescription('Commande pour créer un channel de cast !')
        .addRoleOption(option => option.setName("équipe1_cast").setDescription("Nom de la première équipe à être cast").setRequired(true))
        .addRoleOption(option => option.setName("équipe2_cast").setDescription("Nom de la seconde équipe à être cast").setRequired(true))
        .addUserOption(option => option.setName("co_caster").setDescription("@ de l'utilisateur co_caster").setRequired(false)),
    async execute(interaction) {
        try {
            const allowedRolesId = [process.env.ROLE_ID_STAFF_EBTV, process.env.ROLE_ID_ASSISTANT_TO, process.env.ROLE_ID_CASTER_INDE];

            const guild = interaction.guild;
            const user = interaction.user;

            await interaction.deferReply();

            const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

            const member = await guild.members.fetch(user.id);
            await embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

            const hasAllowedRole = allowedRolesId.some(roleId => member.roles.cache.has(roleId));

            if (!hasAllowedRole) {
                interaction.editReply({ content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: true });
                return;
            }

            const co_caster = interaction.options.getUser("co_caster");
            const memberCoCaster = co_caster ? await guild.members.fetch(co_caster.id) : null;

            const team1Role = interaction.options.getRole('équipe1_cast');
            const team2Role = interaction.options.getRole('équipe2_cast');

            const team1RoleId = team1Role?.id;
            const team2RoleId = team2Role?.id;

            const team1Name = team1Role?.name;
            const team2Name = team2Role?.name;

            // Check if the roles were found
            if (!team1RoleId || !team2RoleId) {
                await interaction.editReply({ content: "Le rôle ou les rôles n'ont pas été trouvés", ephemeral: true });
                return;
            }

            const channelBaseNameFormated = formatingString(`${team1Name}-${team2Name}-cast`);
            const channelBaseNameFormatedReverse = formatingString(`${team2Name}-${team1Name}-cast`);

            const matchData = await fetchUniqueMatch(team1Name, team2Name);

            const divisionName = await fetchUniqueGroup(matchData[0]?.group_id);

            //Regular expression which check for the category presaison name, regardless of emoji if they are any in the category name
            // const targetPattern = /.*pr[eé]saison.*/i; check for presaison

            const divisionPattern = divisionName.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const targetPattern = new RegExp(`.*${divisionPattern}.*`, 'i');

            const preSaisonCategory = await guild.channels.fetch()
                .then(channels => channels.find(channel => channel.type === 4 && targetPattern.test(channel.name)));

            // const preSaisonCategory = guild.channels.cache.filter(channel => channel.type === 4 && targetPattern.test(channel.name)).first(); check for presaison

            if (!preSaisonCategory || preSaisonCategory.size === 0) {
                return await interaction.editReply('La catégorie où doit être placé le salon n\'a pas été trouvée.');
                // return await interaction.reply('La catégorie de présaison n\'a pas été trouvée.');
            }

            const pinPickAndBan = checkDivPickBan(preSaisonCategory.name);

            const isExistingChannel = preSaisonCategory.children.cache.find(channel => channel.name === channelBaseNameFormated.toLowerCase());
            const isExistingChannelReverse = preSaisonCategory.children.cache.find(channel => channel.name === channelBaseNameFormatedReverse.toLowerCase());


            if (isExistingChannel || isExistingChannelReverse) {
                return await interaction.editReply("Le match a déjà été planifié par un autre caster.");
            }

            if (STREAM_IDS[member.id] !== undefined) {
                await setStreamMatch(matchData[0].id, STREAM_IDS[member.id])
                await streamManager.setStreamUrl(member.id)
            }

            const castChannel = await guild.channels.create({
                name: `${team1Name}-${team2Name}-cast`,
                parent: preSaisonCategory.id,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone, // @everyone role
                        deny: [PermissionsBitField.Flags.ViewChannel], // Deny access to everyone
                    },
                    {
                        id: team1RoleId, // Role ID for "équipe1 cast"
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe1 cast"
                    },
                    {
                        id: team2RoleId, // Role ID for "équipe2 cast"
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe2 cast"
                    },
                    {
                        id: process.env.ROLE_ID_STAFF_EBTV,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: process.env.ROLE_ID_ASSISTANT_TO,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: member,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: process.env.BOT_ROLE_ID,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    },
                ],
            });

            const castPreparation = `
 Pour bien préparer le cast, merci d’indiquer :\n
 \u2022 Les pronoms et genres des membres de vos équipes
 \u2022 S’il va y avoir des changements entre les manches
 \u2022 La prononciation du nom de l'équipe ou des pseudos si elle n’est pas simple \n
 Merci également de rejoindre le lobby ingame avec un pseudo reconnaissable !
 
 ${streamManager.getStreamUrl() !== null ? `La diffusion en direct du match est disponible à l'adresse suivante : <${streamManager.getStreamUrl()}>` : ''}`;

            const announcementText = matchData[0].scheduled_datetime ? checkCastTime(matchData[0].scheduled_datetime) : 'Votre match va être cast par';

            if (co_caster && memberCoCaster) {
                castChannel.permissionOverwrites.edit(memberCoCaster, { ViewChannel: true, SendMessages: true });
            }

            const casterAnnouncement = co_caster && memberCoCaster ? ` et <@${memberCoCaster.user.id}>` : '';
            const casterAnnouncementText = `${announcementText} <@${member.user.id}>${casterAnnouncement}`

            await castChannel.send(`# 📣  Cast de votre match 📺 \n <@&${team1RoleId}> <@&${team2RoleId}> \n ${casterAnnouncementText} \n Ce salon vous permettra d'échanger avec le(s) caster(s) et l'autre équipe pour la bonne préparation et le bon déroulement du match. \n ${castPreparation}`);

            if (pinPickAndBan) {
                const msg = await castChannel.send({ files: ['images/s15_pick_ban.png'] });
                await msg.pin();
            }

            await interaction.editReply({ content: `Le channel de cast ${castChannel.name} a été crée par ${member.nickname !== null && member.nickname !== "null" ? member.nickname : member.user.username} (${member.user.username} le ${new Date().toLocaleString()})`, ephemeral: false })

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `Une erreur s'est produite lors de l'exécution de la commande, veuillez réessayer ultérieurement.` });
        }
    },
};
