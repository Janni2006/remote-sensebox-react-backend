const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const fs = require('fs');
const shell = require('shelljs');
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();

const port = new SerialPort('/dev/ttyACM0', {
    baudRate: 9600,
    autoOpen: false
})

port.pipe(parser);

port.on('close', function (err) {
    console.log('port closed');
});

port.on('error', function (err) {
    console.error("error", err);
});

port.on('open', function () {
    console.log('port opened...');
});

parser.on('data', (data) => {
    axios.get(process.env.JSON_SERVER + '/uploads?queue_position=0&demo_completed=false').then(function (response) {
        if (response.data.length > 0) {
            axios.put(process.env.JSON_SERVER + '/uploads/' + response.data[0].id, {
                sketch: response.data[0].sketch,
                xml: response.data[0].xml,
                queue_position: 0,
                friendly_name: response.data[0].friendly_name,
                user: response.data[0].user,
                updated: response.data[0].updated,
                uploaded: response.data[0].uploaded,
                demo_completed: false,
                error: null,
                serial: response.data[0].serial == null ? data : response.data[0].serial + `\n${data}`,
                code: response.data[0].code,
            });
        }
    });
});

const cronJob = new CronJob('20 0/2 * * * *', async function () {
    if (!port.isOpen) {
        port.open();
    }
}, null, true, 'America/Los_Angeles');

module.exports = cronJob;
