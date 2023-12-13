const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const querystring = require('querystring');

function updateTokenInEnvFile(newToken) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    envConfig.TOORNAMENT_TOKEN = newToken.access_token;
    fs.writeFileSync('.env', Object.entries(envConfig).map(([key, value]) => `${key}=${value}`).join('\n'));
  }

async function getNbStage(){
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
    }catch(error){
        console.log(error);
    }
}

async function getTournamentToken(){
    const url = 'https://api.toornament.com/oauth/v2/token';
    const data = {
            'client_id': process.env.TOORNAMENT_CLIENT_ID,
            'client_secret': process.env.TOORNAMENT_CLIENT_SECRET,
            'scope': process.env.SCOPE,
            'grant_type': 'client_credentials',
    }

    console.log(data)

    const formData = querystring.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }

    try{
        axios.post(url, formData, config)
        .then(response => {
            console.log('Response:', response.data);
            return response.data;
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
    }
    catch(error){
        console.log(error)
    }
}

module.exports = {
    getTournamentToken,
    updateTokenInEnvFile,
    getNbStage,
};