const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('supressiondivisionligue')
        .setDescription('Commande pour créer un channel de cast !'),
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
                    // Filter channels to get channels within the current category
                    const channelsInCategory = category.children.cache;

                    channelsInCategory.forEach(channel => {
                        channel.delete();
                    })

                    category.delete();
                });

                interaction.reply({content: `Les divisions de la saison ont bien été supprimée.`, ephemeral: true });
            }
            else {
                return await interaction.reply({content: `Problème avec la commande, la guilde n'a pas été trouvée`, ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            interaction.reply({content: `Une erreur s'est produite lors de l'exécution de la commande : ${error}`, ephemeral: true });
        }
    },
};