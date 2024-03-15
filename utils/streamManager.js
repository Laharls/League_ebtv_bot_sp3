const { getToornamentStreamUrl } = require("./toornamentUtils")

let streamUrl = null;
const STREAM_IDS = require("./../data/streamer_ids.json")

// Getter
function getStreamUrl() {
    return streamUrl;
}

// Setter
async function setStreamUrl(memberId) {
    if (STREAM_IDS[memberId] !== undefined) {
        streamUrl = await getToornamentStreamUrl(STREAM_IDS[memberId]);
    }
}

// Exporting getter/setter functions
module.exports = {
    getStreamUrl,
    setStreamUrl
};