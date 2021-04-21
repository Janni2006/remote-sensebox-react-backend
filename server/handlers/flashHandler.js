const CronJob = require('cron').CronJob;
const axios = require('axios').default;
// const Serial = require('./serialConsoleHandler');
const fs = require('fs');
const shell = require('shelljs');

// const serial_connection = new Serial();

module.exports = new CronJob('1 * * * * *', async function () {
    // serial_connection.stop();
    axios.get(process.env.JSON_SERVER + '/uploads?queue_position=0&demo_completed=false').then(function (response) {
        if (response.data.length > 0) {
            for (var c_position = 0; c_position < response.data.length; c_position++) {
                axios.put(process.env.JSON_SERVER + '/uploads/' + response.data[c_position].id, {
                    sketch: response.data[0].sketch,
                    xml: response.data[0].xml,
                    queue_position: 0,
                    friendly_name: response.data[0].friendly_name,
                    user: response.data[0].user,
                    updated: response.data[0].updated,
                    uploaded: response.data[0].uploaded,
                    demo_completed: true,
                    code: response.data[0].code
                });
            }
        }
    });
    axios.get(process.env.JSON_SERVER + '/uploads?queue_position=1').then(function (response) {
        if (response.data.length > 0) {
            fs.writeFile(__basedir + '/sketch/sketch.ino', response.data[0].sketch, function (err) {
                if (err) throw err;
                shell.exec(`arduino-cli compile --upload ${__basedir}/sketch/sketch.ino --port /dev/ttyACM0 --fqbn sensebox:samd:sb`); //upload
                shell.exec('rm ' + __basedir + '/sketch/sketch.ino');
                // serial_connection.start();
            });
            axios.put(process.env.JSON_SERVER + '/uploads/' + response.data[0].id, {
                sketch: response.data[0].sketch,
                xml: response.data[0].xml,
                queue_position: 0,
                friendly_name: response.data[0].friendly_name,
                user: response.data[0].user,
                updated: response.data[0].updated,
                uploaded: Date.now(),
                demo_completed: false,
                code: response.data[0].code
            });
        }

    });
    axios.get(process.env.JSON_SERVER + '/uploads').then(function (response) {
        for (const object of response.data) {
            if (object.queue_position > 1) {
                axios.put(process.env.JSON_SERVER + '/uploads/' + object.id, {
                    sketch: object.sketch,
                    xml: object.xml,
                    queue_position: object.queue_position - 1,
                    friendly_name: object.friendly_name,
                    user: object.user,
                    created: object.created,
                    uploaded: object.uploaded,
                    demo_completed: false,
                    code: object.code,
                });
            }
        }
    });
}, null, true, 'America/Los_Angeles');
