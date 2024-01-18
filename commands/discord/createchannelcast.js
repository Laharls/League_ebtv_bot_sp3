const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creerchannelcast')
        .setDescription('Commande pour créer un channel de cast !')
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

            const preSaisonCategory = guild.channels.cache.filter(channel => channel.type === 4 && channel.name === "présaison").first();

            if (preSaisonCategory.size === 0) {
                return await interaction.reply('La catégorie "présaison" n\'a pas été trouvée.');
            }

            await guild.channels.create({
                name: `${interaction.options.getRole('équipe1_cast')?.name}-${interaction.options.getRole('équipe2_cast')?.name}-cast`,
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
                ],
            });

            await interaction.reply("Le channel de cast a été correctement créer.")

        } catch (error) {
            console.error(error);
            interaction.reply("Une erreur s'est produite lors de l'exécution de la commande", error);
        }
    },
};