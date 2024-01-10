const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionsBitField } = require('discord.js');
const { getNbStage } = require('./../../utils/toornamentUtils');
const { getTeamsGroup } = require('./../../utils/groupUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannelpermissionligue')
        .setDescription('Commande pour mettre les permissions des différents channels de division.'),
    async execute(interaction) {
        try {
            // Get the guild from the interaction
            const guild = interaction.guild;
            await guild.channels.fetch();
            await guild.channels.fetch();
            const categories = guild.channels.cache.filter(channel => channel.type === 4);
        
            if (categories.size === 0) {
              return await interaction.reply('No categories found in this guild.');
            }

            categories.forEach(category => {
                if(category.name.startsWith("Division")){
                    console.log(`Category Name: ${category.name}`);
                    console.log(`Category ID: ${category.id}`);

                    const match = category.name.match(/\d+/); // Match any digit (\d+)
                    const divNumber =  match ? match[0] : null;

                    const channelsInCategory = guild.channels.cache.filter(channel => channel.type !== 4 && channel.parentId === category.id);
                    if(channelsInCategory.size === 0 ){
                        console.log("No channels found in category")
                    }
                    else {
                        channelsInCategory.forEach(channel => {
                            if(channel.name == `div-${divNumber}-planif`){
                                console.log("Channels bien accessible", channel.name)
                                channel.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                                    SendMessages: true,
                                })
                                console.log("Permission bien setup")
                            }
                            
                            if(channel.name == `div-${divNumber}-récaps-manches`){
                                console.log("setup recaps channel")
                                channel.permissionOverwrites.edit(process.env.ROLE_ID_CAPITAINE, {
                                    SendMessages: true,
                                    AttachFiles: true
                                })
                            }
                        })
                    }
                } 
              });           
        } catch (error) {
            console.error(error);
            interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande : ${error}`, ephemeral: true });
        }
    },
};