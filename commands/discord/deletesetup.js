const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('supressiondivisionligue')
        .setDescription('Commande pour créer un channel de cast ! (Non active)'),
    async execute(interaction) {
        try {
            const guild = interaction.guild;

            if(guild){
                const targetPattern = /^Division \d+$/;
                
                // Filter channels to get categories with names matching the pattern
                const divisionCategories = guild.channels.cache.filter(channel =>
                    channel.type === 4 && targetPattern.test(channel.name)
                );

                // Log the IDs of the matched categories
                divisionCategories.forEach(category => {
                    console.log(`Category Name: ${category.name}, ID: ${category.id}`);

                    // Filter channels to get channels within the current category
                    const channelsInCategory = category.children.cache;

                    channelsInCategory.forEach(channel => {
                        channel.delete();
                    })

                    category.delete();
                });
            }
            else {
                return await interaction.reply('Problème avec la commande, la guilde n\'a pas été trouvée');
            }

            // if (guild) {
            //     guild.channels.cache.forEach((channel) => {
            //         if (channel.type === 0) {
            //             // console.log("channel type recognized")
            //             // Check if the channel is not in any category
            //             if (!channel.parent) {
            //                 // Delete the channel
            //                 channel.delete()
            //                     .then(() => console.log(`Deleted channel: ${channel.name}`))
            //                     .catch((error) => console.error(`Error deleting channel: ${channel.name}`, error));
            //             }
            //         }
            //     });
            // } else {
            //     console.error('Guild not found.');
            // }
        } catch (error) {
            console.error(error);
            interaction.reply("Une erreur s'est produite lors de l'exécution de la commande", error);
        }
    },
};