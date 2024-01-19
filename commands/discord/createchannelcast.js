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
                await interaction.reply({content: "Le rôle ou les rôles n'ont pas été trouvés", ephemeral: true });
                return;
            }

            // Get the guild from the interaction
            const guild = interaction.guild;

            //Regular expression which check for the category presaison name, regardless of emoji if they are any in the category name
            const targetPattern = /.*pr[eé]saison.*/i;

            const preSaisonCategory = guild.channels.cache.filter(channel => channel.type === 4 && targetPattern.test(channel.name)).first();

            if (!preSaisonCategory || preSaisonCategory.size === 0) {
                return await interaction.reply('La catégorie de présaison n\'a pas été trouvée.');
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

            await interaction.reply({content: "Le channel de cast a été correctement créer.", ephemeral: true })

        } catch (error) {
            console.error(error);
            interaction.reply({content: `Une erreur s'est produite lors de l'exécution de la commande : ${error}`, ephemeral: true });
        }
    },
};