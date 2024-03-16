const { embedBuilder } = require("./../../utils/embedBuilder");

async function handleInteractionWithRoles(interaction, allowedRolesId) {
    const guild = interaction.guild;
    const user = interaction.user;

    const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

    const member = await guild.members.fetch(user.id);

    embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

    const hasAllowedRole = allowedRolesId.some(roleId => member.roles.cache.has(roleId));

    if (!hasAllowedRole) {
        throw new Error('Permissions Discord de l\'utilisateur insuffisantes pour la commande.');
    }

    return true;
}

module.exports = {
    handleInteractionWithRoles,
}