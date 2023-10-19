const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createcastchannel')
        .setDescription('Commande pour ajouter automatiquement les rôles des groupes aux capitaines des équipes !')
        .addRoleOption(option => option.setName("équipe1_cast").setDescription("Nom de la première équipe à être cast").setRequired(true))
        .addRoleOption(option => option.setName("équipe2_cast").setDescription("Nom de la seconde équipe à être cast").setRequired(true)),
    async execute(interaction) {
        try {
            const team1RoleId = interaction.options.getRole('équipe1_cast')?.id;
            const team2RoleId = interaction.options.getRole('équipe2_cast')?.id;

            // Check if the roles were found
            if (!team1RoleId || !team2RoleId) {
                interaction.reply('Roles not found.');
                return;
            }

            // Get the guild from the interaction
            const guild = interaction.guild;

            await guild.channels.create({
                name: 'test-cast',
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
                ],
            });

            await interaction.reply("The channel has been succesfully created")

            // // Create a channel with the desired permissions
            // const channel = await guild.channels.create('Cast Channel', {
            //     name: "test-cast",
            //     type: ChannelType.GuildText, // Change to 'voice' for a voice channel
            //     permissionOverwrites: [
            //         {
            //             id: guild.roles.everyone, // @everyone role
            //             deny: [PermissionsBitField.Flags.ViewChannel], // Deny access to everyone
            //         },
            //         {
            //             id: team1RoleId, // Role ID for "équipe1 cast"
            //             allow: [PermissionsBitField.Flags.ViewChannel], // Allow access to "équipe1 cast"
            //         },
            //         {
            //             id: team2RoleId, // Role ID for "équipe2 cast"
            //             allow: [PermissionsBitField.Flags.ViewChannel], // Allow access to "équipe2 cast"
            //         },
            //     ],
            // });

        } catch (error) {
            console.error(error);
            interaction.reply("Une erreur s'est produite lors de l'exécution de la commande", error);
        }
    },
};