const { SlashCommandBuilder } = require('@discordjs/builders');
const { findMatch, setResult } = require("./../../utils/matchUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('score')
        .setDescription("Commande pour mettre le score d'un match un match !")
        .addRoleOption(option => option.setName("équipe1").setDescription("Equipe1").setRequired(true))
        .addStringOption(option => option.setName("score").setDescription("Score du match (ex: 4-0)").setRequired(true))
        .addRoleOption(option => option.setName("équipe2").setDescription("Equipe2").setRequired(true)),
    async execute(interaction) {
        const team1 = interaction.options.getRole("équipe1").name
        const team2 = interaction.options.getRole("équipe2").name
        const score = interaction.options.getString("score");

        if (score && /^\d+-\d+$/.test(score)) {
            const [score1, score2] = score.split('-').map(Number);
        
            if (score1 < score2) {
                [team1, team2] = [team2, team1];
                score = `${score2}-${score1}`;
            }
        } else {
            await interaction.reply("Invalid score format.");
        }

        findMatch(interaction,
            team1,
            team2,
            score,
            setResult);
    },
};