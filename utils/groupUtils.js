require('dotenv').config();
const axios = require('axios');

async function fetchGroup(range) {
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

async function getTeamsGroup(range) {
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
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching teams group: ${error.message}`)
    }
}

module.exports = {
    fetchGroup,
    getTeamsGroup
}