const { SlashCommandBuilder } = require('@discordjs/builders');
const { findMatch, setResult } = require("./../../utils/matchUtils");
const { embedBuilder } = require("./../../utils/embedBuilder");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('score')
        .setDescription("Commande pour mettre le score d'un match un match !")
        .addRoleOption(option => option.setName("équipe1").setDescription("Equipe1").setRequired(true))
        .addStringOption(option => option.setName("score").setDescription("Score du match (ex: 4-0)").setRequired(true))
        .addRoleOption(option => option.setName("équipe2").setDescription("Equipe2").setRequired(true)),
    async execute(interaction) {
        const allowedRolesId = [process.env.ROLE_ID_STAFF_EBTV, process.env.ROLE_ID_ASSISTANT_TO];

        const guild = interaction.guild;
        const user = interaction.user;

        await interaction.deferReply();

        const member = await guild.members.fetch(user.id);
        const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

        await embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

        const hasAllowedRole = allowedRolesId.some(roleId => member.roles.cache.has(roleId));

        if (!hasAllowedRole) {
            interaction.editReply({ content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: true });
            return;
        }

        let team1 = interaction.options.getRole("équipe1").name
        let team2 = interaction.options.getRole("équipe2").name
        let score = interaction.options.getString("score");

        if (score && /^\d+-\d+$/.test(score)) {
            const [score1, score2] = score.split('-').map(Number);

            if (score1 < score2) { //Si le score est indiqué dans le "mauvais sens" (ex: Si team1 2-4 team2, le sens sera inversé team2 4-2 team1)
                const temp = team1;
                team1 = team2;
                team2 = temp;
                score = `${score2}-${score1}`;
            }
        } else {
            await interaction.editReply({ content: "Format du score invalide.", ephemeral: true });
        }

        findMatch(interaction,
            team1,
            team2,
            score,
            setResult);
    },
};
