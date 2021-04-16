const CronJob = require('cron').CronJob;
const axios = require('axios').default;

module.exports = new CronJob('1 * * * * *', async function () {
    axios.get(process.env.JSON_SERVER + '/uploads').then(function (response) {
        for (const object of response.data) {
            if (object.updated < Date.now() - process.env.DELETE_DIF && object.queue_position == 0 && object.uploaded < Date.now() - process.env.DELETE_DIF) {
                axios.delete(process.env.JSON_SERVER + '/uploads/' + object.id);
            }
        }
    });
}, null, true, 'America/Los_Angeles');
