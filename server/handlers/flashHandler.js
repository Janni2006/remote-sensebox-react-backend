const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const fs = require('fs');
const shell = require('shelljs');

const cronJob = new CronJob('0/2 * * * *', async function () {
    axios.get(process.env.JSON_SERVER + '/uploads?_order=queue_position').then(function (response) {
        if (response.data.length > 0) {
            let uploaded = false;
            for (const item of response.data) {
                if (item.queue_position == 0 && item.demo_completed == false && item.uploaded + 1 <= Date.now()) {
                    axios.put(process.env.JSON_SERVER + '/uploads/' + item.id, {
                        sketch: item.sketch,
                        xml: item.xml,
                        queue_position: 0,
                        friendly_name: item.friendly_name,
                        user: item.user,
                        updated: item.updated,
                        uploaded: item.uploaded,
                        demo_completed: true,
                        error: item.error,
                        serial: item.serial,
                        code: item.code
                    });
                }
                if (item.queue_position > 1) {
                    axios.put(process.env.JSON_SERVER + '/uploads/' + item.id, {
                        sketch: item.sketch,
                        xml: item.xml,
                        queue_position: item.queue_position - 1,
                        friendly_name: item.friendly_name,
                        user: item.user,
                        updated: item.updated,
                        uploaded: item.uploaded,
                        demo_completed: false,
                        error: null,
                        serial: item.serial,
                        code: item.code,
                    });
                }
                if (item.queue_position == 1 && !uploaded) {
                    uploaded = true;
                    fs.writeFile(__basedir + '/sketch/sketch.ino', item.sketch, async function (err) {
                        if (err) throw err;
                        shell.exec(
                            `arduino-cli compile --upload ${__basedir}/sketch/sketch.ino --port /dev/ttyACM0 --fqbn sensebox:samd:sb`,
                            { async: true, silent: true },
                            function (code, stdout, stderr) {
                                shell.exec('rm ' + __basedir + '/sketch/sketch.ino');
                                if (code == 0) {
                                    axios.put(process.env.JSON_SERVER + '/uploads/' + item.id, {
                                        sketch: item.sketch,
                                        xml: item.xml,
                                        queue_position: 0,
                                        friendly_name: item.friendly_name,
                                        user: item.user,
                                        updated: item.updated,
                                        uploaded: Date.now(),
                                        demo_completed: false,
                                        error: null,
                                        serial: item.serial,
                                        code: item.code
                                    });
                                } else {
                                    let error = stderr.toString();
                                    axios.put(process.env.JSON_SERVER + '/uploads/' + item.id, {
                                        sketch: item.sketch,
                                        xml: item.xml,
                                        queue_position: 0,
                                        friendly_name: item.friendly_name,
                                        user: item.user,
                                        updated: item.updated,
                                        uploaded: Date.now(),
                                        demo_completed: false,
                                        error: error,
                                        serial: null,
                                        code: item.code
                                    });
                                }
                            }); //upload            
                    });

                }
            }
        }
    });
}, null, true, 'America/Los_Angeles');

module.exports = cronJob;
