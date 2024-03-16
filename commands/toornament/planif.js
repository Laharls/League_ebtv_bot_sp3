const { SlashCommandBuilder } = require('@discordjs/builders');
const { findMatch, setPlanif } = require("./../../utils/matchUtils");
const { checkUserPermissions } = require("./../../utils/logging/logger");
const { embedBuilder } = require("./../../utils/embedBuilder");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('planif')
        .setDescription('Commande pour planifier un match !')
        .addRoleOption(option => option.setName("équipe1").setDescription("Equipe1").setRequired(true))
        .addRoleOption(option => option.setName("équipe2").setDescription("Equipe2").setRequired(true))
        .addStringOption(option => option.setName("date").setDescription("Date (JJ/MM/AAAA)").setRequired(true))
        .addStringOption(option => option.setName("heure").setDescription("Heure (HH:mm)").setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        
        checkUserPermissions(interaction, [process.env.ROLE_ID_STAFF_EBTV, process.env.ROLE_ID_ASSISTANT_TO])

        const cestOffset = "+01:00"; //TIMEZONE (+1:00 heure hiver/ +2:00 heure été)
        const dateInput = interaction.options.getString("date");
        const hourInput = interaction.options.getString("heure");

        const dateRegex = new RegExp(/^\d{2}\/\d{2}\/\d{4}$/) //Check date is format JJ/MM/YYYY
        if (!dateRegex.test(dateInput)) {
            await interaction.editReply("Le format de la date est invalide, veuillez réessayer en entrant une date valide.")
            return;
        }

        const hourRegex = new RegExp(/^\d{2}:\d{2}$/) //Check hour is format HH:MM
        if (!hourRegex.test(hourInput)) {
            await interaction.editReply("Le format de l'heure est invalide, veuillez réessayer en entrant une heure valide.")
            return;
        }

        // Parse the date string
        const dateParts = interaction.options.getString("date").split('/');
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Months in JavaScript are 0-based (0-11)
        const year = parseInt(dateParts[2], 10);

        // Parse the hour string
        const hourParts = interaction.options.getString("heure").split(':');
        const hours = parseInt(hourParts[0], 10);
        const minutes = parseInt(hourParts[1], 10);

        const combinedDate = new Date(year, month, day, hours, minutes);

        const formattedDate = `${combinedDate.getFullYear()}-${String(combinedDate.getMonth() + 1).padStart(2, '0')}-${String(combinedDate.getDate()).padStart(2, '0')}T${String(combinedDate.getHours()).padStart(2, '0')}:${String(combinedDate.getMinutes()).padStart(2, '0')}:${String(combinedDate.getSeconds()).padStart(2, '0')}${cestOffset}`;

        findMatch(interaction,
            interaction.options.getRole("équipe1").name,
            interaction.options.getRole("équipe2").name,
            formattedDate,
            setPlanif
        );
    },
};
