const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedBuilder } = require("./../../utils/embedBuilder");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleancastpresaison')
        .setDescription('Commande pour nettoyer les salons de cast de la présaison.'),
    async execute(interaction) {
        try {
            const guild = interaction.guild;
            const user = interaction.user;
            const MINUTE_IN_MILLISECONDS = 60_000;
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

            //Check for présaison or presaison pattern
            const targetPattern = /.*pr[eé]saison.*/i;

            const preSaisonCategory = guild.channels.cache.filter(channel => channel.type === CHANNEL_CATEGORY_TYPE && targetPattern.test(channel.name)).first();

            if (!preSaisonCategory || preSaisonCategory.size === 0) {
                return await interaction.reply('La catégorie de présaison n\'a pas été trouvée.');
            }

            const presaisonChannels = preSaisonCategory.children.cache;

            const channelsNotStartingWithPrésaison = presaisonChannels.filter(channel => !targetPattern.test(channel.name));

            const channelNamesToDeleteString = channelsNotStartingWithPrésaison.map(channel => `- ${channel.name}`).join('\n');

            if (channelNamesToDeleteString.length === 0) {
                return await interaction.reply({ content: `Aucun salon de cast de présaison à supprimer.`, ephemeral: false });
            }

            //Set up like an embed message, to make it clear what the bot will delete
            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Supprimer salon cast')
                .setStyle(ButtonStyle.Danger);

            const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Annuler')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(confirm, cancel);

            const response = await interaction.reply({
                content: `Êtes-vous sûr de vouloir supprimer les salons \n${channelNamesToDeleteString} :`,
                components: [row],
            });

            const collectorFilter = i => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: MINUTE_IN_MILLISECONDS });

                if (confirmation.customId === 'confirm') {
                    channelsNotStartingWithPrésaison.forEach(channel => {
                        channel.delete();
                    })
                    await confirmation.update({ content: "Les salons de cast de présaison ont bien été supprimé.", components: [] });
                } else if (confirmation.customId === 'cancel') {
                    await confirmation.update({ content: "Action annulé", components: [] });
                }
            } catch (e) {
                await interaction.editReply({ content: 'Aucune confirmation reçu dans la minute, annulation', components: [] });
            }

        } catch (error) {
            console.error(error);
            interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande`, ephemeral: false });
        }
    },
};
