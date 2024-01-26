const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionsBitField } = require('discord.js');
const { getNbStage } = require('./../../utils/toornamentUtils');
const { getTeamsGroup } = require('./../../utils/groupUtils');
const { embedBuilder } = require("./../../utils/embedBuilder");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creerdivisionligue')
        .setDescription('Commande pour créer automatiquement les divisions de la ligue !'),
    async execute(interaction) {
        try {
            // Get the guild from the interaction
            const guild = interaction.guild;
	    const user = interaction.user;

	    const member = await guild.members.fetch(user.id);
	    const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

	    await embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

	    if(!member.roles.cache.has(process.env.ROLE_ID_STAFF_EBTV)){
		interaction.reply({content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: true});
		return;
	    }

            const nbDivToCreate = await getNbStage();
            const teams = await getTeamsGroup();

            // Function to get role ID by name
            const getRoleIdByName = (roleName) => {
                const role = guild.roles.cache.find((role) => role.name === roleName);
                return role ? role.id : null;
            };

            for(let i = 1; i < nbDivToCreate + 1; i++){
                const divisionTeams = teams[`Division ${i}`];

                // Map the team names to role IDs
                const divisionRoleID = divisionTeams.map((teamName) => getRoleIdByName(teamName));

                const category = await guild.channels.create({
                    name: `Division ${i}`,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone, // @everyone role
                            deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Deny access to everyone
                        },
                        {
                            id: process.env.BOT_ROLE_ID,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });

                await guild.channels.create({
                    name: `division-${i}`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                const planif = await guild.channels.create({
                    name: `div-${i}-planif`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                const support = await guild.channels.create({
                    name: `div-${i}-support`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                const recap = await guild.channels.create({
                    name: `div-${i}-récaps-manches`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                const discussion = await guild.channels.create({
                    name: `div-${i}-discussion`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                for (const roleId of divisionRoleID) {
                    const role = await guild.roles.fetch(roleId);
                    if (role) {
                        await category.permissionOverwrites.edit(roleId, {
                            ViewChannel: true,
                            SendMessages: false
                        });
                    }
                }
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande : ${error}`, ephemeral: true });
        }
    },
};
