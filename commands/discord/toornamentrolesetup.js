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
            const guild = interaction.guild;
            const captainRoleName = interaction.options.getRole("capitaine").name
            const range = interaction.options.getString("range")

            //First step : Get all Captains of each teams

            const teams = await fetchParticipant(range);
            const participantCaptains = teams.map(team => {
                const captain = team.custom_fields.capitaines !== null && team.custom_fields.capitaines !== undefined
                    ? team.custom_fields.capitaines
                    : team.lineup[0].name;
                return { captain, team: team.name };
            })

            //Second step : Get groups & teams groups + check if role is existing (create it otherwise)
            const groups = await fetchGroup();
            const teamGroups = await getTeamsGroup();
            const groupIdHashmap = new Map();

            for (const group of groups) {
                const roleName = group.name
                if (!guild.roles.cache.some(role => role.name === roleName)) {
                    const role = await guild.roles.create({ name: roleName });
                    console.log(`Rôle ${role.name} created`);
                }

                groupIdHashmap.set(group.id, roleName);
            }

            //Third step : Compare team group ids with group ids, when equal, add role to captain member

            for (const teamGroup of teamGroups) {
                const { captain } = participantCaptains.find(obj => obj.team === teamGroup.participant.name);
                const members = await guild.members.fetch({ query: captain, limit: 1 });
                const member = members.first();

                if (!member) {
                    continue;
                }

                const role = guild.roles.cache.find(r => r.name === groupIdHashmap.get(teamGroup.group_id));


                if (!role) {
                    continue;
                }

                const hasCaptainRole = member.roles.cache.some(r => r.name === captainRoleName);

                if (!hasCaptainRole) {
                    continue;
                }

                await member.roles.add(role);
            }
        } catch (error) {
            console.error(error);
            interaction.reply("Une erreur s'est produite lors de l'exécution de la commande", error);
        }
    },
};