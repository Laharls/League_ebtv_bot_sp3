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
            const CHANNEL_CATEGORY_TYPE = 4;

            const member = await guild.members.fetch(user.id);
            const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

            embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

            if (!member.roles.cache.has(process.env.ROLE_ID_ADMIN)) {
                interaction.reply({ content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: false });
                return;
            }

            if (!guild) {
                return await interaction.reply({ content: `Problème avec la commande, la guilde n'a pas été trouvée`, ephemeral: false });
            }

            //Check for a pattern Division followed by a numeric value
            const targetPattern = /^Division \d+$/;

            const divisionCategories = guild.channels.cache.filter(channel =>
                channel.type === CHANNEL_CATEGORY_TYPE && targetPattern.test(channel.name)
            );

            divisionCategories.forEach(category => {
                const channelsInCategory = category.children.cache;

                channelsInCategory.forEach(channel => {
                    channel.delete();
                })

                category.delete();
            });

            interaction.reply({ content: `Les divisions de la saison ont bien été supprimée.` });


        } catch (error) {
            console.error(error);
            interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande : ${error}`, ephemeral: false });
        }
    },
};
