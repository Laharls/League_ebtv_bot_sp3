const { SlashCommandBuilder } = require('@discordjs/builders');
const { findMatch, setReport } = require("./../../utils/matchUtils");
const { embedBuilder } = require("./../../utils/embedBuilder");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Commande pour reporter un match !')
        .addRoleOption(option => option.setName("équipe1").setDescription("Equipe1").setRequired(true))
        .addRoleOption(option => option.setName("équipe2").setDescription("Equipe2").setRequired(true))
        .addRoleOption(option => option.setName("reporte_par").setDescription("Reporté par :").setRequired(true)),
    async execute(interaction) {
        const allowedRolesId = [process.env.ROLE_ID_STAFF_EBTV, process.env.ROLE_ID_ASSISTANT_TO];

        const guild = interaction.guild;
        const user = interaction.user;

        await interaction.deferReply();

        const member = await guild.members.fetch(user.id);
        const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

        embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

        const hasAllowedRole = allowedRolesId.some(roleId => member.roles.cache.has(roleId));

        if (!hasAllowedRole) {
            interaction.editReply({ content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: true });
            return;
        }

        const team1 = interaction.options.getRole("équipe1").name
        const team2 = interaction.options.getRole("équipe2").name
        const teamReport = interaction.options.getRole("reporte_par").name

        findMatch(interaction,
            team1,
            team2,
            teamReport,
            setReport);
    },
};
