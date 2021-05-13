const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();
const logger = require('../config/winston');

/* abstract */ class SerialStore {
    findSession(id) { }
    saveSession(id, session) { }
    findAllSessions() { }
}

class InMemorySerialStore extends SerialStore {
    constructor() {
        super();
        this.serial = new String();
        this.sketch = new String();
    }

    setRunningSketch(id) {
        this.sketch = id;
    }

    addSerial(data) {
        this.serial = this.serial + data;
    }

    clearSerial() {
        this.serial = new String();
        this.sketch = new SerialPort();
    }

    getAllSerial() {
        return this.serial;
    }

    getRunningSketch() {
        return this.sketch;
    }
}

const wsSerial = require('../websockets/wsSerial');

const port = new SerialPort('/dev/ttyACM0', {
    baudRate: 9600,
    autoOpen: false
})

var serial = "";

const serialStore = new InMemorySerialStore();

port.pipe(parser);

port.on('close', function (err) {
    logger.debug("Serial Port closed")
    axios.get(`${process.env.JSON_SERVER}/uploads?code=${serialStore.getRunningSketch()}`).then(function (response) {
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
                serial: serialStore.getAllSerial(),
                code: response.data[0].code,
            });
        }
    });
    console.log("serial: ", serialStore.getAllSerial());
    serialStore.clearSerial();
});

port.on('error', function (err) {
    logger.error(err.toString());
});

port.on('open', function () {
    logger.debug("Serial Port opened")
    axios.get(process.env.JSON_SERVER + '/uploads?queue_position=0&demo_completed=false').then(function (response) {
        if (response.data.length > 0) {
            serialStore.setRunningSketch(response.data[0].code);
        }
    });
});

parser.on('data', (data) => {
    serialStore.addSerial(data);
});

const cronJob = new CronJob('20 0/2 * * * *', async function () {
    if (!port.isOpen) {
        port.open();
    }
}, null, true, 'America/Los_Angeles');

module.exports = cronJob;
