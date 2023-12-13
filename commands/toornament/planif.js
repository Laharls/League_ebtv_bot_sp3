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
        const cestOffset = "+01:00"; //TIMEZONE (+1:00 heure hiver/ +2:00 heure été)

        // Parse the date string
        const dateParts = interaction.options.getString("date").split('/');
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Months in JavaScript are 0-based (0-11)
        const year = parseInt(dateParts[2], 10);

        console.log(dateParts)

        // Parse the hour string
        const hourParts = interaction.options.getString("heure").split(':');
        const hours = parseInt(hourParts[0], 10);
        const minutes = parseInt(hourParts[1], 10);

        const combinedDate = new Date(year, month, day, hours, minutes);

        const formattedDate = `${combinedDate.getFullYear()}-${String(combinedDate.getMonth() + 1).padStart(2, '0')}-${String(combinedDate.getDate()).padStart(2, '0')}T${String(combinedDate.getHours()).padStart(2, '0')}:${String(combinedDate.getMinutes()).padStart(2, '0')}:${String(combinedDate.getSeconds()).padStart(2, '0')}${cestOffset}`;

        findMatch(interaction,
            team1,
            team2,
            formattedDate,
            setPlanif
        );
    },
};