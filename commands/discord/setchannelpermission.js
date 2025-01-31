const { SlashCommandBuilder } = require('@discordjs/builders');
const { getTeamsGroup } = require('./../../utils/groupUtils');
const { embedBuilder } = require("./../../utils/embedBuilder");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('permissiondivisionligue')
        .setDescription('Commande pour mettre les permissions des différents channels de division.'),
    async execute(interaction) {
        try {
            // Get the guild from the interaction
            const guild = interaction.guild;
            const user = interaction.user;

            const stageIds = [
                "7536642295841865728",
                "7536640081084391424",
                "7536596345101762560",
                "7536593471567388672",
                "7536584899792535552",
                "7536577779904667648",
                "7536551181308936192",
                "7536546455548297216",
                "7536542055986692096",
                "7536536195342868480",
                "7536519095150829568",
            ]

            const member = await guild.members.fetch(user.id);
            const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

            embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

            if (!member.roles.cache.has(process.env.ROLE_ID_STAFF_EBTV)) {
                interaction.reply({ content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: true })
                return;
            }

            const targetPattern = /^Division \d+$/;
            await guild.channels.fetch();

            const allTeamsByStage = {};

            for (let i = 0; i < stageIds.length; i++) {
                const stageId = stageIds[i];
                const teamsByDivision = await getTeamsGroup(stageId);
                allTeamsByStage[`Division ${i + 1}`] = teamsByDivision;
            }

            // // Function to get role ID by name
            // const getRoleIdByName = (roleName) => {
            //     const role = guild.roles.cache.find((role) => role.name === roleName);
            //     return role ? role.id : null;
            // };

            const getRoleIdByName = (roleName) => {
                // Convert roleName to lowercase and sanitize multiple whitespace characters
                const roleNameSanitized = roleName.toLowerCase().replace(/\s+/g, ' ');
                const role = guild.roles.cache.find((role) => {
                    // Convert role.name to lowercase and sanitize multiple whitespace characters
                    const roleNameLowerSanitized = role.name.toLowerCase().replace(/\s+/g, ' ');
                    return roleNameLowerSanitized === roleNameSanitized;
                });
                return role ? role.id : null;
            };

            const categories = guild.channels.cache.filter(channel => channel.type === 4 && targetPattern.test(channel.name));

            const categoriesArray = [...categories.values()];

            const sortedCategories = categoriesArray.sort((a, b) => {
                const divisionNumberA = parseInt(a.name.match(/\d+/)[0]);
                const divisionNumberB = parseInt(b.name.match(/\d+/)[0]);

                return divisionNumberA - divisionNumberB;
            });

            if (categories.size === 0) {
                return await interaction.reply('Aucune catégorie de division trouvés dans le serveur.');
            }

            for (const [incrementIndex, category] of sortedCategories.entries()) {

                const divisionTeams = allTeamsByStage[`Division ${incrementIndex + 1}`];
                const divisionRoleID = divisionTeams.map((teamName) => getRoleIdByName(teamName));

                //Set permission for TO Organiser
                //await category.permissionOverwrites.edit(process.env.ROLE_ID_STAFF_EBTV, {
                    //ViewChannel: true,
                    //SendMessages: true,
                    //CreatePublicThreads: true,
                    //SendMessagesInThreads: true
                //})

                //await category.permissionOverwrites.edit(process.env.ROLE_ID_ASSISTANT_TO, {
                    //ViewChannel: true,
                    //SendMessages: true,
                    //CreatePublicThreads: true,
                    //SendMessagesInThreads: true
                //})

                const filteredDivisionRoleId = divisionRoleID.filter(id => id != null)
                for (const roleId of filteredDivisionRoleId) {
                    const role = await guild.roles.fetch(roleId);
                    if (role) {
                        await category.permissionOverwrites.edit(roleId, {
                            ViewChannel: true,
                            SendMessages: false,
                            SendMessagesInThreads: true,
                            CreatePublicThreads: false,
                            CreatePrivateThreads: false
                        });
                    }
                }

                const match = category.name.match(/\d+/); // Match any digit (\d+)
                const divNumber = match ? match[0] : null;

                const channelsInCategory = category.children.cache;

                for (const [channelId, channel] of channelsInCategory) {
                    if (channel.name == `div-${divNumber}-planif`) {
                        await channel.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                            SendMessages: true,
                        })
                    }

                    if (channel.name == `div-${divNumber}-support`) {
                        const divisionTeams = allTeamsByStage[`Division ${incrementIndex + 1}`];
                        const divisionRoleID = divisionTeams.map((teamName) => getRoleIdByName(teamName));

                        const filteredDivisionRoleId = divisionRoleID.filter(id => id != null)
                        for (const roleId of filteredDivisionRoleId) {
                            const role = await guild.roles.fetch(roleId);
                            if (role) {
                                await channel.permissionOverwrites.edit(roleId, {
                                    SendMessages: true
                                });
                            }
                        }
                    }

                    if (channel.name == `div-${divNumber}-récaps-manches`) {
                        await channel.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                            SendMessages: true,
                            AttachFiles: true
                        })
                    }

                    if (channel.name == `div-${divNumber}-discussion`) {
                        const divisionTeams = allTeamsByStage[`Division ${incrementIndex + 1}`];
                        const divisionRoleID = divisionTeams.map((teamName) => getRoleIdByName(teamName));

                        const filteredDivisionRoleId = divisionRoleID.filter(id => id != null)
                        for (const roleId of filteredDivisionRoleId) {
                            const role = await guild.roles.fetch(roleId);
                            if (role) {
                                await channel.permissionOverwrites.edit(roleId, {
                                    SendMessages: true
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande : ${error}`, ephemeral: true });
        }
    },
};
