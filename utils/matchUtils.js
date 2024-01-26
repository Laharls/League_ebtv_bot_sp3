require('dotenv').config();
const axios = require('axios');

const { getTournamentToken, updateTokenInEnvFile } = require('./toornamentUtils');
const TEAM_IDS = require("./../data/test_ids.json")

async function fetchMatches(team1, team2) {
    const url =`https://api.toornament.com/organizer/v2/matches?participant_ids=${TEAM_IDS[team1]},${TEAM_IDS[team2]}&tournament_ids=${process.env.TOORNAMENT_ID}`;
    const config = {
        headers: {
            'X-Api-Key': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`,
            'Range': "matches=0-99",
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
        throw new Error(`Error fetching matches: ${error.message}`);
    }
}

async function findMatch(interaction, team1, team2, data, callback) {
    try {
        const matches = await fetchMatches(team1, team2);
        // return;

        let match_id = 0;
        let opponent1;
        let opponent2;

        for (const match of matches) {
            const opp = match.opponents;
            console.log(opp);

            if (
                !opp[0]?.participant?.name ||
                !opp[1]?.participant?.name
            ) {
                // Skip the current iteration if either name is null
                continue;
            }

            if (
                (opp[0].participant.name.toLowerCase() === team1.toLowerCase() ||
                    opp[0].participant.name.toLowerCase() === team2.toLowerCase()) &&
                (opp[1].participant.name.toLowerCase() === team1.toLowerCase() ||
                    opp[1].participant.name.toLowerCase() === team2.toLowerCase())
            ) {
                //Only search for pending matches
                //check if match participants are the searched one
                match_id = match.id;
                data.stage_id = match.stage_id;
                opponent1 = opp[0].participant;
                opponent2 = opp[1].participant;
                break;
            }
        }
        // If no match is found
        if (match_id == 0) {
            interaction.reply({ content: `Il n'y a pas de match entre ${team1} et ${team2}, vérifier les teams.`})
        } else {
            callback(interaction, data, match_id, team1, team2, opponent1, opponent2);
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const token = await getTournamentToken();
            await updateTokenInEnvFile(token);
            process.exit();
        }
        console.error(error);
    }
}


async function setPlanif(interaction, match_date, match_id, team1, team2) {
    const url = `https://api.toornament.com/organizer/v2/matches/${match_id}`;
    const headers = {
        'X-Api-Key': process.env.API_KEY,
        'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`, //Verify what should be the value of Bearer token
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.patch(url, { scheduled_datetime: match_date }, { headers });

        switch (response.status) {
            case 200:
                if (match_date) {

                    await interaction.reply({ content: `Le match entre ${team1} et ${team2} a été planifié le ${match_date.substring(0, 10)} à ${match_date.substring(11, 16)}.`} )
                } else {
                    await interaction.reply({ content: `Le match entre ${team1} et ${team2} a été annulé.`, ephemeral: true });
                }
                break;
            case 400:
                await interaction.reply({ content: 'Requête invalide.', ephemeral: true });
                break;
            case 403:
                await interaction.reply({ content: "L'application n'est pas autorisée à accéder au tournoi.", ephemeral: true });
                break;
            case 404:
                await interaction.reply({ content: 'Match non trouvé.', ephemeral: true });
                break;
            case 500:
            case 503:
                await interaction.reply({ content: 'Erreur serveur. Veuillez réessayer plus tard.', ephemeral: true })
                break;
            default:
                console.error(`Unhandled status code: ${response.status}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const token = await getTournamentToken();
            await updateTokenInEnvFile(token);
            process.exit();
        }
        console.error(error);
    }
}


async function setReport(interaction, teamRep, match_id, team1, team2) {
    const url = `https://api.toornament.com/organizer/v2/matches/${match_id}`;
    const headers = {
        'X-Api-Key': process.env.API_KEY,
        'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`, //Verify what should be the value of Bearer token
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.patch(url, {
            scheduled_datetime: null,
            public_note: `Report ${teamRep}`,
        }, { headers });

        switch (response.status) {
            case 200:
                await interaction.reply({ content: `Le match entre ${team1} et ${team2} a été reporté par ${teamRep}`});
                break;
            case 400:
                await interaction.reply({ content: 'Requête invalide.', ephemeral: true });
                break;
            case 403:
                await interaction.reply({ content: "L'application n'est pas autorisée à accéder au tournoi.", ephemeral: true });
                break;
            case 404:
                await interaction.reply({ content: 'Match non trouvé.', ephemeral: true });
                break;
            case 500:
            case 503:
                await interaction.reply({ content: 'Erreur serveur. Veuillez réessayer plus tard.', ephemeral: true })
                break;
            default:
                console.error(`Unhandled status code: ${response.status}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const token = await getTournamentToken();
            await updateTokenInEnvFile(token);
            process.exit();
        }
        console.error(error);
    }
}

async function setResult(interaction, score, match_id, winner, loser, opponent1, opponent2) {
    const url = `https://api.toornament.com/organizer/v2/matches/${match_id}`
    const headers = {
        'X-Api-Key': process.env.API_KEY,
        'Authorization': `Bearer ${process.env.TOORNAMENT_TOKEN}`, //Verify what should be the value of Bearer token
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.patch(url, {
            status: "completed",
            opponents: [
                {
                    name: opponent1.name,
                    result: opponent1.name.toLowerCase() === winner.toLowerCase() ? "win" : "loss",
                    score: opponent1.name.toLowerCase() === winner.toLowerCase() ? parseInt(score[0], 10) : parseInt(score[2], 10),
                },
                {
                    name: opponent2.name,
                    result: opponent2.name.toLowerCase() === winner.toLowerCase() ? "win" : "loss",
                    score: opponent2.name.toLowerCase() === winner.toLowerCase() ? parseInt(score[0], 10) : parseInt(score[2], 10),
                },
            ],
        }, { headers })

        switch (response.status) {
            case 200:
                score = `**${score[0]}**-${score[2]}`;
                await interaction.reply({ content: `Résultat du match : **${winner}** ${score} ${loser}`});
                break;
            case 400:
                await interaction.reply({ content: 'Requête invalide.', ephemeral: true });
                break;
            case 403:
                await interaction.reply({ content: "L'application n'est pas autorisée à accéder au tournoi.", ephemeral: true });
                break;
            case 404:
                await interaction.reply({ content: 'Match non trouvé.', ephemeral: true });
                break;
            case 500:
            case 503:
                await interaction.reply({ content: 'Erreur serveur. Veuillez réessayer plus tard.', ephemeral: true })
                break;
            default:
                console.error(`Unhandled status code: ${response.status}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const token = await getTournamentToken();
            await updateTokenInEnvFile(token);
            process.exit();
        }
        console.error(error)
        interaction.reply({ content: "Le match n'existe pas.", ephemeral: true })
    }
}

module.exports = {
    findMatch,
    setPlanif,
    setReport,
    setResult
}