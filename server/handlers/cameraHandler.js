const CronJob = require('cron').CronJob;

module.exports = new CronJob('0/2 * * * *', async function () {
}, null, true, 'America/Los_Angeles')
