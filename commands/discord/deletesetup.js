const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedBuilder } = require("./../../utils/embedBuilder");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('supressiondivisionligue')
        .setDescription('Commande pour créer un channel de cast !'),
    async execute(interaction) {
        try {
            const guild = interaction.guild;
	    const user = interaction.user;

	    const member = await guild.members.fetch(user.id);
	    const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

	    await embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

	    if(!member.roles.cache.has(process.env.ROLE_ID_ADMIN)){
                interaction.reply({content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: true});
                return;
            }

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
