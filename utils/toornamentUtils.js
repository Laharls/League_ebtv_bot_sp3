const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const querystring = require('querystring');

function updateTokenInEnvFile(newToken) {
    console.log('token toornament', newToken)
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    envConfig.TOORNAMENT_TOKEN = newToken.access_token;
    fs.writeFileSync('.env', Object.entries(envConfig).map(([key, value]) => `${key}=${value}`).join('\n'));
}

async function getNbStage() {
    const url = `https://api.toornament.com/organizer/v2/stages?tournament_ids=${process.env.TOORNAMENT_ID}`
    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
            'Range': "stages=0-49",
        }
    }

    try {
        const response = await axios.get(url, config);
        return response.data.reduce((sum, item) => sum + item.settings.nb_groups, 0);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const token = await getTournamentToken();
            await updateTokenInEnvFile(token);
            process.exit();
        }
        console.log(error);
    }
}

async function getTournamentToken() {
    const url = 'https://api.toornament.com/oauth/v2/token';
    const data = {
        'client_id': process.env.TOORNAMENT_CLIENT_ID,
        'client_secret': process.env.TOORNAMENT_CLIENT_SECRET,
        'scope': process.env.SCOPE,
        'grant_type': 'client_credentials',
    }

    const formData = querystring.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }

    try {
        const response = await axios.post(url, formData, config);
        return response.data;
    }
    catch (error) {
        console.log(error)
    }
}

async function setStreamUrl(name, urlStream) {
    const url = 'https://api.toornament.com/organizer/v2/streams';
    const data = {
        "tournament_id": process.env.TOORNAMENT_ID,
        "name": name,
        "url": urlStream,
        "language": "fr",
    }

    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
            'Content-Type': 'application/json',
        }
    }

    try {
        const response = await axios.post(url, data, config);
        return response.data;
    }
    catch (error) {
        console.log(error)
    }
}

async function setStreamMatch(match_id, stream_id) {
    const url = `https://api.toornament.com/organizer/v2/matches/${match_id}/streams`
    const data = [
        stream_id
    ]

    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
            'Content-Type': 'application/json',
        }
    }

    const response = await axios.put(url, data, config);
    return true;
}

async function getToornamentStreamUrl(stream_id) {
    const url = `https://api.toornament.com/organizer/v2/streams/${stream_id}`
    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
        }
    }

    const response = await axios.get(url, config);
    return response.data.url;
}

module.exports = {
    getTournamentToken,
    updateTokenInEnvFile,
    getNbStage,
    setStreamUrl,
    setStreamMatch,
    getToornamentStreamUrl
};