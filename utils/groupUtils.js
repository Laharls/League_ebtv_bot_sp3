require('dotenv').config();
const axios = require('axios');

const { getTournamentToken, updateTokenInEnvFile } = require('./toornamentUtils');

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
        if (error.response && error.response.status === 401) {
            const token = await getTournamentToken();
            await updateTokenInEnvFile(token);
            process.exit();
        }
        throw new Error(`Error fetching groups: ${error.message}`);
    }
}

async function fetchUniqueGroup(group) {
    const url =`https://api.toornament.com/organizer/v2/groups/${group}`;
    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
        }
    }

    try {
        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const token = await getTournamentToken();
            await updateTokenInEnvFile(token);
            process.exit();
        }
        throw new Error(`Une erreur est survenue : ${error.message}`);
    }
}

async function getTeamsGroup(stage_id) {
    const url =`https://api.toornament.com/organizer/v2/ranking-items?tournament_ids=${process.env.TOORNAMENT_ID}&stage_ids=${stage_id}`
    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
            'Range': `items=0-49`,
        }
    }

    try {
        const response = await axios.get(url, config);
        const teamsData = response.data;

        const teams = [];

        // Group teams by group_id
        teamsData.forEach(team => {
            teams.push(team.participant?.name); // Assuming 'name' is the team name
        });
    
        return teams; 
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const token = await getTournamentToken();
            await updateTokenInEnvFile(token);
            process.exit();
        }
        throw new Error(`Error fetching teams group: ${error.message}`)
    }
}

module.exports = {
    fetchGroup,
    getTeamsGroup,
    fetchUniqueGroup
}