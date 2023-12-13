require('dotenv').config();
const axios = require('axios');

async function fetchGroup(range="0-49") {
    const url =`https://api.toornament.com/organizer/v2/groups?tournament_ids=${process.env.TOORNAMENT_ID}`;
    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
            'Range': `groups=${range}`,
        }
    }

    try {
        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching groups: ${error.message}`);
    }
}

async function getTeamsGroup(range="0-49") {
    const url =`https://api.toornament.com/organizer/v2/ranking-items?tournament_ids=${process.env.TOORNAMENT_ID}`
    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
            'Range': `items=${range}`,
        }
    }

    try {
        const response = await axios.get(url, config);
        const groupName = await fetchGroup();

        // Filter out entries where participant is null
        const validEntries = response.data.filter(entry => entry.participant !== null);

        // Group entries by group_id
        const groupedByGroup = validEntries.reduce((grouped, entry) => {
        const groupId = entry.group_id;
        if (!grouped[groupId]) {
            grouped[groupId] = [];
        }
        grouped[groupId].push(entry);
        return grouped;
        }, {});

        const groupSettings = groupName.reduce((settingsMap, group) => {
            settingsMap[group.id] = group.name;
            return settingsMap;
          }, {});

        // Extract team names for each group
        const teamNamesByGroup = Object.keys(groupedByGroup).reduce((result, groupId) => {
            const teamNames = groupedByGroup[groupId].map(entry => entry.participant.name);
            const groupName = groupSettings[groupId];
            result[groupName] = teamNames;
            return result;
          }, {});

          const sortedTeamNamesByGroup = Object.keys(teamNamesByGroup)
            .sort()
            .reduce((result, key) => {
                result[key] = teamNamesByGroup[key];
                return result;
            }, {});
        
            return sortedTeamNamesByGroup;
    } catch (error) {
        throw new Error(`Error fetching teams group: ${error.message}`)
    }
}

module.exports = {
    fetchGroup,
    getTeamsGroup,
}