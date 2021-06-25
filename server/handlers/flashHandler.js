const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const db = require('../database');
const fs = require('fs');
const shell = require('shelljs');
const logger = require('../config/winston')

module.exports = new CronJob('0/10 * * * * *', async function () {
    axios.get(process.env.JSON_SERVER + '/uploads?_order=queue_position').then(async function (response) {
        if (response.data.length > 0) {
            let run_next = true;
            for (const item of response.data) {
                if (item.queue_position == 0 && item.demo_completed == false && item.uploaded + (process.env.SKETCH_RUNTIME / 10000) > Date.now()) {
                    run_next=false
                }
            }
            if(run_next==true){
                console.log("run next")
                let uploaded = false;
                for (const item of response.data) {
                    if (item.queue_position == 0 && item.demo_completed == false && item.uploaded + (process.env.SKETCH_RUNTIME / 10000) <= Date.now()) {
                        db.updateItem(item, { demo_completed: true });
                    }
                    if (item.queue_position > 1) {
                        db.updateItem(item, { queue_position: item.queue_position - 1 })
                    }
                    if (item.queue_position == 1 && !uploaded) {
                        uploaded = true;
                        db.updateItem(item, { queue_position: 0 });
                        uploadSketch(item);
                    }
                }
            }            
        }
    });
}, null, true, 'America/Los_Angeles');

function uploadSketch(item) {
    fs.writeFile(__basedir + '/sketch/sketch.ino', item.sketch, async function (err) {
        if (err) throw err;
        shell.exec(
            `arduino-cli compile --upload ${__basedir}/sketch/sketch.ino --port /dev/ttyACM0 --fqbn sensebox:samd:sb`,
            { async: true, silent: true },
            function (code, stdout, stderr) {
                shell.exec('rm ' + __basedir + '/sketch/sketch.ino');
                if (code == 0) {
                    logger.info(`Uploaded sketch ${item.friendly_name}`)
                    db.updateItem(item, { queue_position: 0, uploaded: Date.now() });
                } else {
                    let error = stderr.toString();
                    db.updateItem(
                        item,
                        {
                            queue_position: 0,
                            uploaded: Date.now(),
                            demo_completed: true,
                            error: error
                        }
                    );
                    console.log(stderr)
                    logger.error(error);
                }
            });
    });
}
