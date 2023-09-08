const { SlashCommandBuilder } = require('@discordjs/builders');
const { findMatch, setPlanif } = require("./../../utils/matchUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('planif')
        .setDescription('Commande pour planifier un match !')
        .addRoleOption(option => option.setName("équipe1").setDescription("Equipe1").setRequired(true))
        .addRoleOption(option => option.setName("équipe2").setDescription("Equipe2").setRequired(true))
        .addStringOption(option => option.setName("date").setDescription("Date (JJ/MM/AAAA)").setRequired(true))
        .addStringOption(option => option.setName("heure").setDescription("Heure (HH:mm)").setRequired(true)),
    async execute(interaction) {
        const team1 = interaction.options.getRole("équipe1").name
        const team2 = interaction.options.getRole("équipe2").name
        const utcdiff = 2; //TIMEZONE

        let datematch = interaction.options.getString("date");

        // Regular expression to match common date formats (DD-MM, DD-MM-YY, YYYY-MM-DD)
        const dateRegex = /^(\d{2}-\d{2}(-\d{2}|\d{4}))$/;

        if (dateRegex.test(datematch)) {
            datematch = datematch.replace(/\//g, '-'); // Replace slashes with hyphens
            // If the date format is "DD-MM" or "DD-MM-YY," add the current year
            if (datematch.length <= 5) {
                datematch += `-${new Date().getFullYear()}`;
            }
            // If the date format is "YYYY-MM-DD," rearrange it to "DD-MM-YYYY"
            else if (datematch.length === 10 && datematch[2] === '-') {
                datematch = datematch.split('-').reverse().join('-');
            }
        }
        let hour = interaction.options.getString("heure")


        findMatch(interaction,
            team1,
            team2,
            datematch + "T" + hour + ":00+0" + utcdiff + ":00",
            setPlanif
        );
    },
};