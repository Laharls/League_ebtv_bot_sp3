require('dotenv').config();
const axios = require('axios');
const TEAM_IDS = require("./../data/TEAM_IDS.json")

//Don't forget to add the range parameter for the API !

async function fetchMatches(team1, team2) {
    const url = `https://api.toornament.com/viewer/v2/matches?participant_ids=${TEAM_IDS[team1]},${TEAM_IDS[team2]}&tournament_ids=${process.env.TOORNAMENT_LIGUE}`;
    const config = {
        headers: {
            'X-Api-Key': process.env.TOORNAMENT_TOKEN,
        }
    }

    try {
        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching matches: ${error.message}`);
    }
}

async function findMatch(interaction, team1, team2, data, callback) {
    try {
        const matches = await fetchMatches(team1, team2);

        let match_id = 0;
        let opponent1;
        let opponent2;

        for (const match of matches) {
            const opp = match.opponents;

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
        if (match_id == 0 && (range == "0-127" || !range)) {
            getMatch(interaction, team1, team2, data, callback, "128-255");
        } else {
            callback(interaction, data, match_id, team1, team2, opponent1, opponent2);
        }
    } catch (error) {
        console.error(error);
    }
}


async function setPlanif(interaction, match_date, match_id, team1, team2) {
    const url = `https://api.toornament.com/organizer/v2/matches/${match_id}`;
    const headers = {
        'X-Api-Key': process.env.TOORNAMENT_TOKEN,
        'Authorization': `Bearer ${process.env.TOORNAMENT_AUTH}`, //Verify what should be the value of Bearer token
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.patch(url, { scheduled_datetime: match_date }, { headers });

        switch (response.status) {
            case 200:
                if (match_date) {
                    await interaction.editReply(
                        `Le match entre ${team1} et ${team2} a été planifié le ${match_date.substring(0, 10)} à ${match_date.substring(11, 16)}.`
                    )
                } else {
                    await interaction.editReply(`Le match entre ${team1} et ${team2} a été annulé.`);
                }
                break;
            case 400:
                await interaction.editReply('Requête invalide.');
                break;
            case 403:
                await interaction.editReply("L'application n'est pas autorisée à accéder au tournoi.");
                break;
            case 404:
                await interaction.editReply('Match non trouvé.');
                break;
            case 500:
            case 503:
                await interaction.editReply('Erreur serveur. Veuillez réessayer plus tard.')
                break;
            default:
                console.error(`Unhandled status code: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
    }
}


async function setReport(interaction, teamRep, match_id, team1, team2) {
    const url = `https://api.toornament.com/organizer/v2/matches/${match_id}`;
    const headers = {
        'X-Api-Key': process.env.TOORNAMENT_TOKEN,
        'Authorization': `Bearer ${process.env.TOORNAMENT_AUTH}`, //Verify what should be the value of Bearer token
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.patch(url, {
            scheduled_datetime: null,
            public_note: `Report ${teamRep}`,
        }, { headers });

        switch (response.status) {
            case 200:
                await interaction.editReply(
                    `Le match entre ${team1} et ${team2} a été reporté par ${teamRep}`
                );
                break;
            case 400:
                await interaction.editReply('Requête invalide.');
                break;
            case 403:
                await interaction.editReply("L'application n'est pas autorisée à accéder au tournoi.")
                break;
            case 404:
                await interaction.editReply("Match non trouvé.")
                break;
            case 500:
            case 503:
                await interaction.editReply('Erreur serveur. Veuillez réessayer plus tard.')
                break;
            default:
                console.error(`Unhandled status code: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
    }
}

async function setResult(interaction, score, match_id, winner, loser, opponent1, opponent2) {
    const url = `https://api.toornament.com/organizer/v2/matches/${match_id}`
    const headers = {
        'X-Api-Key': process.env.TOORNAMENT_TOKEN,
        'Authorization': `Bearer ${process.env.TOORNAMENT_AUTH}`, //Verify what should be the value of Bearer token
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
                interaction.editReply(`Résultat du match : **${winner}** ${score} ${loser}`);
                break;
            case 400:
                interaction.editReply("Requête invalide.");
                break;
            case 403:
                interaction.editReply("L'application n'est pas autorisée à accéder au tournoi.");
                break;
            case 404:
                interaction.editReply("Match non trouvé.");
                break;
            case 500:
            case 503:
                interaction.editReply("Erreur serveur. Veuillez réessayer plus tard.");
                break;
            default:
                interaction.editReply("Veuillez réessayez ultérieurement")
        }
    } catch (error) {
        console.error(error)
        interaction.editReply("Le match n'existe pas ou a déjà été joué.")
    }
}

module.exports = {
    findMatch,
    setPlanif,
    setReport,
    setResult
}