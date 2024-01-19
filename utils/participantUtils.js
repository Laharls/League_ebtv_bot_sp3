require('dotenv').config();
const axios = require('axios');

const { getTournamentToken, updateTokenInEnvFile } = require('./toornamentUtils');

async function fetchParticipant(range) {
    const url =`https://api.toornament.com/organizer/v2/participants?tournament_ids=${process.env.TOORNAMENT_ID}`;
    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
            'Range': `participants=${range}`,
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
        throw new Error(`Error fetching participants: ${error.message}`);
    }
}

module.exports = {
    fetchParticipant
}