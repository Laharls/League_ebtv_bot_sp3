const { SlashCommandBuilder } = require('@discordjs/builders');
const { findMatch, setReport } = require("./matchUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Commande pour reporter un match !')
        .addRoleOption(option => option.setName("équipe1").setDescription("Equipe1").setRequired(true))
        .addRoleOption(option => option.setName("équipe2").setDescription("Equipe2").setRequired(true))
        .addRoleOption(option => option.setName("reporte_par").setDescription("Reporté par :").setRequired(true)),
    async execute(interaction) {
        const team1 = interaction.options.getRole("équipe1").name
        const team2 = interaction.options.getRole("équipe2").name
        const teamReport = interaction.options.getRole("reporte_par").name

        findMatch(interaction,
            team1,
            team2,
            teamRep,
            setReport);
    },
};