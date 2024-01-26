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

            const member = await guild.members.fetch(user.id);
	    const channel = await guild.channels.cache.get(process.env.CHANNEL_ID_LOG_BOT);

	    await embedBuilder("Log O.R.C.A", member, channel, interaction.commandName);

            if(!member.roles.cache.has(process.env.ROLE_ID_STAFF_EBTV)){
                interaction.reply({content: `Vous n'avez pas les permissions requises à l'utilisation de cette commande.`, ephemeral: true})
                return;
            }

            const targetPattern = /^Division \d+$/;
            await guild.channels.fetch();

            const teams = await getTeamsGroup();

            // // Function to get role ID by name
            const getRoleIdByName = (roleName) => {
                const role = guild.roles.cache.find((role) => role.name === roleName);
                return role ? role.id : null;
            };

            const categories = guild.channels.cache.filter(channel => channel.type === 4 && targetPattern.test(channel.name));
        
            if (categories.size === 0) {
              return await interaction.reply('No categories found in this guild.');
            }

            let incrementIndex = 0; //To get the role id for later to set channel permissions

            categories.forEach(category => {
                incrementIndex++;
                const match = category.name.match(/\d+/); // Match any digit (\d+)
                const divNumber =  match ? match[0] : null;
                
                // Filter channels to get channels within the current category
                const channelsInCategory = category.children.cache;

                channelsInCategory.forEach(channel => {
                    console.log(channel.name)
                    if(channel.name == `div-${divNumber}-planif`){
                        channel.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                            SendMessages: true,
                        })
                    }

                    if(channel.name == `div-${divNumber}-support`){
                        const divisionTeams = teams[`Division ${incrementIndex}`];
                        const divisionRoleID = divisionTeams.map((teamName) => getRoleIdByName(teamName));
                        for(const roleId of divisionRoleID){
                            const role = guild.roles.fetch(roleId);
                            if (role) {
                                channel.permissionOverwrites.edit(roleId, {
                                    SendMessages: true
                                });
                            }
                        }
                    }

                    if(channel.name == `div-${divNumber}-récaps-manches`){
                        channel.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                            SendMessages: true,
                            AttachFiles: true
                        })
                    }

                    if(channel.name == `div-${divNumber}-discussion`){
                        const divisionTeams = teams[`Division ${incrementIndex}`];
                        const divisionRoleID = divisionTeams.map((teamName) => getRoleIdByName(teamName));
                        for(const roleId of divisionRoleID){
                            const role = guild.roles.fetch(roleId);
                            if (role) {
                                channel.permissionOverwrites.edit(roleId, {
                                    SendMessages: true
                                });
                            }
                        }
                    }
                })
            })
              interaction.reply({ content: 'Les permissions ont bien été ajoutés.', ephemeral: true})
        } catch (error) {
            console.error(error);
            interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande : ${error}`, ephemeral: true });
        }
    },
};
