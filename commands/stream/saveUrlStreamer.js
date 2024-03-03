const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedBuilder } = require("../../utils/embedBuilder");
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urlcaster')
        .setDescription('Commande pour enregistrer l\'url lié à une chaîne Youtube ou Twitch !')
        .addStringOption(option => option.setName("pseudo").setDescription("Nom par lequel vous souhaitez être nommé.").setRequired(true))
        .addStringOption(option => option.setName("url").setDescription("Url de la chaîne de stream").setRequired(true)),
    async execute(interaction) {
        try {
            const allowedRolesId = [process.env.ROLE_ID_STAFF_EBTV, process.env.ROLE_ID_ASSISTANT_TO, process.env.ROLE_ID_CASTER_INDE];

            const guild = interaction.guild;
            const user = interaction.user;

            await interaction.deferReply();

            const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

            const member = await guild.members.fetch(user.id);
            await embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

            const hasAllowedRole = allowedRolesId.some(roleId => member.roles.cache.has(roleId));

            if (!hasAllowedRole) {
                interaction.editReply({ content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: true });
                return;
            }

            const urlPattern = new RegExp(/^https:\/\/(www\.)?(youtube\.com|twitch\.tv)\/(.+)+$/) //Check for a youtube or twitch url
            if(!urlPattern.test(interaction.options.getString('url'))){
                await interaction.editReply({ content: `L'url donné n'est pas d'une chaîne Youtube ou Twitch.`, ephemeral: false })
                return;
            }

            let data = {};

            //Check if the file exist and parse the data in JSON format
            if (fs.existsSync('data/streamer.json')) {
                const rawData = fs.readFileSync('data/streamer.json');
                data = JSON.parse(rawData);
            }

            data[user.id] = {name: interaction.options.getString('pseudo'), url : interaction.options.getString('url')} ;

            fs.writeFileSync('data/streamer.json', JSON.stringify(data, null, 1));

            await interaction.editReply({ content: `Donnée sauvegardé avec succès !`, ephemeral: false })

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `Une erreur s'est produite lors de l'exécution de la commande, veuillez réessayer ultérieurement.` });
        }
    },
};