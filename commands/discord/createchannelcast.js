const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionsBitField } = require('discord.js');
const { embedBuilder } = require("./../../utils/embedBuilder");
const { formatingString } = require("./../../utils/utilityTools");
const { fetchUniqueMatch } = require("./../../utils/matchUtils");
const { fetchUniqueGroup } = require('../../utils/groupUtils');

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

            const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

            const member = await guild.members.fetch(user.id);
            await embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

            const hasAllowedRole = allowedRolesId.some(roleId => member.roles.cache.has(roleId));

            if(!hasAllowedRole){
            interaction.reply({content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: true});
            return;
            }

            const co_caster = interaction.options.getUser("co_caster");
            const memberCoCaster = (co_caster !== null && co_caster !== undefined) ? await guild.members.fetch(co_caster.id) : false;

            const team1RoleId = await interaction.options.getRole('équipe1_cast')?.id;
            const team2RoleId = await interaction.options.getRole('équipe2_cast')?.id;

            const team1Name = await interaction.options.getRole('équipe1_cast')?.name
            const team2Name = await interaction.options.getRole('équipe2_cast')?.name

            // Check if the roles were found
            if (!team1RoleId || !team2RoleId) {
                await interaction.reply({ content: "Le rôle ou les rôles n'ont pas été trouvés", ephemeral: true });
                return;
            }

            const channelBaseNameFormated = formatingString(`${team1Name}-${team2Name}-cast`);
            const channelBaseNameFormatedReverse = formatingString(`${team2Name}-${team1Name}-cast`);

            const group_id = await fetchUniqueMatch(team1Name, team2Name);

            const divisionName = await fetchUniqueGroup(group_id[0].group_id);


            //Regular expression which check for the category presaison name, regardless of emoji if they are any in the category name
            // const targetPattern = /.*pr[eé]saison.*/i; check for presaison

            const divisionPattern = divisionName.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const targetPattern = new RegExp(`.*${divisionPattern}.*`, 'i');

            const preSaisonCategory = await guild.channels.fetch()
                .then(channels => channels.find(channel => channel.type === 4 && targetPattern.test(channel.name)));

            // const preSaisonCategory = guild.channels.cache.filter(channel => channel.type === 4 && targetPattern.test(channel.name)).first(); check for presaison

            if (!preSaisonCategory || preSaisonCategory.size === 0) {
                return await interaction.reply('La catégorie où doit être placé le salon n\'a pas été trouvée.');
                // return await interaction.reply('La catégorie de présaison n\'a pas été trouvée.');
            }

            const isExistingChannel = preSaisonCategory.children.cache.find(channel => channel.name === channelBaseNameFormated.toLowerCase());
            const isExistingChannelReverse = preSaisonCategory.children.cache.find(channel => channel.name === channelBaseNameFormatedReverse.toLowerCase());


            if (isExistingChannel || isExistingChannelReverse) {
                return await interaction.reply("Le match a déjà été planifié par un autre caster.");
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

            if (co_caster && memberCoCaster) {
                castChannel.permissionOverwrites.edit(memberCoCaster, { ViewChannel: true, SendMessages: true });
                await castChannel.send(`# 📣  Cast de votre match 📺 \n <@&${team1RoleId}> <@&${team2RoleId}> \n Votre match est prévu pour être casté par <@${member.user.id}> et <@${memberCoCaster.user.id}> \n Ce salon vous permettra d'échanger avec le(s) caster(s) et l'autre équipe pour la bonne préparation et le bon déroulement du match.`)
            }
            else {
                await castChannel.send(`# 📣  Cast de votre match 📺 \n <@&${team1RoleId}> <@&${team2RoleId}> \n Votre match est prévu pour être casté par <@${member.user.id}> \n Ce salon vous permettra d'échanger avec le(s) caster(s) et l'autre équipe pour la bonne préparation et le bon déroulement du match.`)
            }

            await interaction.reply({ content: `Le channel de cast ${castChannel.name} a été crée par ${member.nickname} (${member.user.username} le ${new Date().toLocaleString()})`, ephemeral: false })

        } catch (error) {
            console.error(error);
            interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande : ${error}`, ephemeral: true });
        }
    },
};
