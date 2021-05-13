const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const shell = require('shelljs');
const fs = require('fs');

module.exports = new CronJob('1 * * * * *', async function () {
    axios.get(process.env.JSON_SERVER + '/uploads').then(function (response) {
        for (const object of response.data) {
            if (object.updated < Date.now() - process.env.DELETE_DIF && object.queue_position == 0 && object.uploaded < Date.now() - process.env.DELETE_DIF) {
                axios.delete(process.env.JSON_SERVER + '/uploads/' + object.id);
            }
        }
    });
    // videos = fs.readdirSync(__basedir + '/video/');

    // for (var i = 0; i < videos.length; i++) {
    //     if (videos[i].split(".")[0] <= Date.now() - 100 * 60 * 60 * 6) {
    //         shell.exec(`rm ${__basedir}/video/${videos[i]}`)
    //     }
    // }
}, null, true, 'America/Los_Angeles');
