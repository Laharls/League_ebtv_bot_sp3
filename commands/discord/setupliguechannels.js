const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionsBitField } = require('discord.js');
const { getNbStage } = require('./../../utils/toornamentUtils');
const { getTeamsGroup } = require('./../../utils/groupUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupleague')
        .setDescription('Commande pour créer automatiquement les divisions de la ligue !'),
    async execute(interaction) {
        try {
            // Get the guild from the interaction
            const guild = interaction.guild;

            const nbDivToCreate = await getNbStage();
            const teams = await getTeamsGroup();
            console.log(teams);
            console.log(nbDivToCreate);

            // await interaction.reply({ content: "Les divisions de la ligue sont en cours de création" })

            // Function to get role ID by name
            const getRoleIdByName = (roleName) => {
                const role = guild.roles.cache.find((role) => role.name === roleName);
                return role ? role.id : null;
            };

            for(let i = 1; i < nbDivToCreate + 1; i++){
                const divisionTeams = teams[`Division ${i}`];

                // Map the team names to role IDs
                const divisionRoleID = divisionTeams.map((teamName) => getRoleIdByName(teamName));

                console.log(divisionRoleID);

                const category = await guild.channels.create({
                    name: `Division ${i}`,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone, // @everyone role
                            deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Deny access to everyone
                        },
                        {
                            id: process.env.BOT_ROLE_ID,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                        // {
                        //     id: process.env.ROLE_ID_STAFF_EBTV,
                        //     allow: [PermissionsBitField.Flags.Administrator],
                        // },
                    ]
                });

                await guild.channels.create({
                    name: `division-${i}`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                const planif = await guild.channels.create({
                    name: `div-${i}-planif`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                const support = await guild.channels.create({
                    name: `div-${i}-support`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                const recap = await guild.channels.create({
                    name: `div-${i}-récaps-manches`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                const discussion = await guild.channels.create({
                    name: `div-${i}-discussion`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                });

                for (const roleId of divisionRoleID) {
                    const role = await guild.roles.fetch(roleId);
                    if (role) {
                        console.log("roleID NOW", roleId)
                        await category.permissionOverwrites.edit(roleId, {
                            ViewChannel: true,
                            SendMessages: false
                        });
                    }
                }

                // await category.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                //     ViewChannel: true,
                //     SendMessages: false
                // })

                // const capitaineRole = await guild.roles.fetch(process.env.ROLE_ID_CAPITAINE);
                // if(capitaineRole){
                //     console.log("Role id capitaine valid")
                //     await planif.permissionOverwrites.edit(capitaineRole, {
                //         SendMessages: true
                //     })
                // }

                // await planif.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                //     SendMessages: true
                // })

                // await recap.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                //     SendMessages: true,
                //     AttachFiles: true
                // })

                // await support.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                //     SendMessages: true
                // })

                // await discussion.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                //     SendMessages: true
                // })
                

                // Set permission overwrites for roles in the array
                console.log('divroleID', divisionRoleID);
                // for (const roleId of divisionRoleID) {
                //     const role = await guild.roles.fetch(roleId);
                //     if (role) {
                //         const channel = guild.channels.resolve(support.id);  
                //         await channel.permissionOverwrites.edit(role, {
                //             SendMessages: true,
                //         });

                //         const discussionChannel = guild.channels.resolve(discussion.id);  
                //         await discussionChannel.permissionOverwrites.edit(role, {
                //             SendMessages: true,
                //         });
                //     }
                // }
            }
            // await interaction.reply({ content: "Les divisions de la ligue ont été crées avec succès", ephemeral: true } )
        } catch (error) {
            console.error(error);
            interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande : ${error}`, ephemeral: true });
        }
    },
};