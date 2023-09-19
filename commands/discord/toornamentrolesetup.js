const { SlashCommandBuilder } = require('@discordjs/builders');
const { fetchParticipant } = require("../../utils/participantUtils");
const { fetchGroup, getTeamsGroup } = require("../../utils/groupUtils");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuptoornamentroles')
        .setDescription('Commande pour ajouter automatiquement les rôles des groupes aux capitaines des équipes !')
        .addRoleOption(option => option.setName("capitaine").setDescription("Rôle capitaine").setRequired(true))
        .addStringOption(option => option.setName("range").setDescription("Portée du nombre d'équipe récupérée (ex:0-49)").setRequired(true)),
    async execute(interaction) {
        try {
            // Destructure properties from interaction
            const { guild, options } = interaction;

            const captainRoleName = options.getRole("capitaine")?.name;
            const range = options.getString("range");

            // Check if captainRoleName is valid
            if (!captainRoleName) {
                console.log("No captain role name found");
                return;
            }

            // Find the captain role in the guild's role cache
            const captainRole = guild.roles.cache.find(role => role.name === captainRoleName);

            if (!captainRole) {
                console.log("Captain role not found");
                return;
            }

            // Fetch groups and team groups
            const groups = await fetchGroup(range);
            const teamGroups = await getTeamsGroup(range);

            const groupIdHashmap = new Map(groups.map(group => [group.id, group.name]));

            // Get members with the captain role
            const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(captainRole.id));

            // Loop through members with the captain role
            membersWithRole.forEach(member => {
                const team = member.nickname?.split('-')[0];

                // Find the corresponding team group
                const teamGroup = teamGroups.find(teamGroup => teamGroup.participant.name === team);

                if (teamGroup) {
                    const roleName = groupIdHashmap.get(teamGroup.group_id);
                    const roleGroup = guild.roles.cache.find(role => role.name === roleName);

                    if (roleGroup) {
                        member.roles.add(roleGroup);
                    }
                }
            });

        } catch (error) {
            console.error(error);
            interaction.reply("Une erreur s'est produite lors de l'exécution de la commande", error);
        }
    },
};