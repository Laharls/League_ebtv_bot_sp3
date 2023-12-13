const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionsBitField } = require('discord.js');
const { getNbStage } = require('./../../utils/toornamentUtils');
const { getTeamsGroup } = require('./../../utils/groupUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupleague')
        .setDescription('Commande pour ajouter automatiquement les rôles des groupes aux capitaines des équipes !'),
    async execute(interaction) {
        try {
            // Get the guild from the interaction
            const guild = interaction.guild;

            const nbDivToCreate = await getNbStage();
            const teams = await getTeamsGroup();
            console.log(teams);
            console.log(nbDivToCreate);

            // Function to get role ID by name
            const getRoleIdByName = (roleName) => {
                const role = guild.roles.cache.find((role) => role.name === roleName);
                return role ? role.id : null;
            };

            const division1Teams = teams['Division 1'];

            // Map the team names to role IDs
            const division1RoleIDs = division1Teams.map((teamName) => getRoleIdByName(teamName));

            console.log(division1RoleIDs);

            const category = await guild.channels.create({
                name: `Division 1`,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone, // @everyone role
                        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Deny access to everyone
                    },
                    {
                        id: process.env.ROLE_ID_CAPITAINE, //NE PAS OUBLIER DE REMPLACER PAR ID STAFF EBTV
                        allow: [PermissionsBitField.Flags.ViewChannel], // Allow access to "équipe1 cast"
                        deny: [PermissionsBitField.Flags.SendMessages],
                    },
                    // {
                    //     id: process.env.ROLE_ID_STAFF_EBTV, //NE PAS OUBLIER DE REMPLACER PAR ID STAFF EBTV
                    //     allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe1 cast"
                    //     deny: [PermissionsBitField.Flags.SendMessages],
                    // },
                ]
            });

            await guild.channels.create({
                name: `division-1`,
                parent: category.id,
                type: ChannelType.GuildText,
            });

            const planif = await guild.channels.create({
                name: `div-1-planif`,
                parent: category.id,
                type: ChannelType.GuildText,
            });

            const support = await guild.channels.create({
                name: `div-1-support`,
                parent: category.id,
                type: ChannelType.GuildText,
            });

            const recap = await guild.channels.create({
                name: `div-1-récaps-manches`,
                parent: category.id,
                type: ChannelType.GuildText,
            });

            const discussion = await guild.channels.create({
                name: `div-1-discussion`,
                parent: category.id,
                type: ChannelType.GuildText,
            });

            for (const roleId of division1RoleIDs) {
                const role = await guild.roles.fetch(roleId);
                if (role) {
                    console.log("roleID NOW", roleId)
                    await category.permissionOverwrites.edit(roleId, {
                        ViewChannel: true,
                        SendMessages: false
                    });
                }
            }

            await planif.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                SendMessages: true
            })

            await recap.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                SendMessages: true,
                AttachFiles: true
            })

            await support.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                SendMessages: true
            })

            await discussion.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                SendMessages: true
            })
            

            // Set permission overwrites for roles in the array
            console.log('divroleID', division1RoleIDs);
            for (const roleId of division1RoleIDs) {
                const role = await guild.roles.fetch(roleId);
                if (role) {
                    const channel = guild.channels.resolve(support.id);  
                    await channel.permissionOverwrites.edit(role, {
                        SendMessages: true,
                    });

                    const discussionChannel = guild.channels.resolve(discussion.id);  
                    await discussionChannel.permissionOverwrites.edit(role, {
                        SendMessages: true,
                    });
                }
            }
            console.log('Finished')
            return;

            for(let i = 1; i < 1 + 1; i++) {
                const category = await guild.channels.create({
                    name: `Division ${i}`,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone, // @everyone role
                            deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Deny access to everyone
                        },
                        {
                            id: process.env.ROLE_ID_CAPITAINE, //NE PAS OUBLIER DE REMPLACER PAR ID STAFF EBTV
                            allow: [PermissionsBitField.Flags.ViewChannel], // Allow access to "équipe1 cast"
                            deny: [PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: process.env.ROLE_ID_STAFF_EBTV, //NE PAS OUBLIER DE REMPLACER PAR ID STAFF EBTV
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe1 cast"
                            deny: [PermissionsBitField.Flags.SendMessages],
                        },
                    ]
                });

                await guild.channels.create({
                    name: `division-${i}`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone, // @everyone role
                            deny: [PermissionsBitField.Flags.SendMessages], // Deny access to write to everyone
                        },
                    ],
                });

                await guild.channels.create({
                    name: `div-${i}-planif`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: process.env.ROLE_ID_CAPITAINE, // @everyone role
                            deny: [PermissionsBitField.Flags.SendMessages], // Deny access to everyone
                        }
                    ],
                });

                await guild.channels.create({
                    name: `div-${i}-support`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone, // @everyone role
                            deny: [PermissionsBitField.Flags.ViewChannel], // Deny access to everyone
                        },
                    ],
                });

                await guild.channels.create({
                    name: `div-${i}-récaps-manches`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                    // permissionOverwrites: [
                    //     {
                    //         id: guild.roles.everyone, // @everyone role
                    //         deny: [PermissionsBitField.Flags.ViewChannel], // Deny access to everyone
                    //     },
                    //     {
                    //         id: team1RoleId, // Role ID for "équipe1 cast"
                    //         allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe1 cast"
                    //     },
                    //     {
                    //         id: team2RoleId, // Role ID for "équipe2 cast"
                    //         allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe2 cast"
                    //     },
                    // ],
                });

                await guild.channels.create({
                    name: `div-${i}-discussion`,
                    parent: category.id,
                    type: ChannelType.GuildText,
                    // permissionOverwrites: [
                    //     {
                    //         id: guild.roles.everyone, // @everyone role
                    //         deny: [PermissionsBitField.Flags.ViewChannel], // Deny access to everyone
                    //     },
                    //     {
                    //         id: team1RoleId, // Role ID for "équipe1 cast"
                    //         allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe1 cast"
                    //     },
                    //     {
                    //         id: team2RoleId, // Role ID for "équipe2 cast"
                    //         allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe2 cast"
                    //     },
                    // ],
                });

            }

            return;

            guild.channels.cache.forEach(channel => {
                console.log(`${channel.name} (${channel.type})`);
            });

            // Fetch the category by name
            const fetchedCategory = guild.channels.cache.find(channel => channel.name === 'Division 1' && channel.type === 'GUILD_CATEGORY');
            // console.log(fetchedCategory);

            await guild.channels.create({
                name: 'test-cast',
                parent: category.id,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone, // @everyone role
                        deny: [PermissionsBitField.Flags.ViewChannel], // Deny access to everyone
                    },
                    {
                        id: team1RoleId, // Role ID for "équipe1 cast"
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe1 cast"
                    },
                    {
                        id: team2RoleId, // Role ID for "équipe2 cast"
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow access to "équipe2 cast"
                    },
                ],
            });

            await interaction.reply("The channel has been succesfully created")

            // // Create a channel with the desired permissions
            // const channel = await guild.channels.create('Cast Channel', {
            //     name: "test-cast",
            //     type: ChannelType.GuildText, // Change to 'voice' for a voice channel
            //     permissionOverwrites: [
            //         {
            //             id: guild.roles.everyone, // @everyone role
            //             deny: [PermissionsBitField.Flags.ViewChannel], // Deny access to everyone
            //         },
            //         {
            //             id: team1RoleId, // Role ID for "équipe1 cast"
            //             allow: [PermissionsBitField.Flags.ViewChannel], // Allow access to "équipe1 cast"
            //         },
            //         {
            //             id: team2RoleId, // Role ID for "équipe2 cast"
            //             allow: [PermissionsBitField.Flags.ViewChannel], // Allow access to "équipe2 cast"
            //         },
            //     ],
            // });

        } catch (error) {
            console.error(error);
            interaction.reply("Une erreur s'est produite lors de l'exécution de la commande", error);
        }
    },
};