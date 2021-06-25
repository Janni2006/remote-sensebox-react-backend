const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();
const logger = require('../config/winston');
const uuid = require('../uuid');

/* abstract */ class SerialStore {
    setRunningSketch(id, user) { }
    addSerial(data) { }
    clearSerial() { }
    getAllSerial() { }
}

class InMemorySerialStore extends SerialStore {
    constructor() {
        super();
        this.serial = new String();
        this.sketch = new String();
    }

    setRunningSketch(id, user) {
        this.sketch = id;
        this.user = user;
    }

    addSerial(data) {
        this.serial = this.serial + data;
    }

    clearSerial() {
        this.serial = new String();
        this.sketch = new String();
        this.user = new String();
    }

    getAllSerial() {
        return this.serial;
    }

    getRunningSketch() {
        return this.sketch;
    }

    getSketchUser() {
        return this.user;
    }
}

const port = new SerialPort('/dev/ttyACM0', {
    baudRate: parseInt(process.env.SERIAL_RATE),
    autoOpen: false
})

const serialStore = new InMemorySerialStore();

port.pipe(parser);

port.on('close', function (err) {
    logger.info("Serial Port closed");
    axios.get(`${process.env.JSON_SERVER}/uploads?code=${serialStore.getRunningSketch()}`).then(async function (response) {
        if (response.data.length > 0) {
            await axios.put(process.env.JSON_SERVER + '/uploads/' + response.data[0].id, {
                sketch: response.data[0].sketch,
                xml: response.data[0].xml,
                queue_position: 0,
                friendly_name: response.data[0].friendly_name,
                user: response.data[0].user,
                updated: response.data[0].updated,
                uploaded: response.data[0].uploaded,
                demo_completed: response.data[0].demo_completed,
                error: response.data[0].error,
                serial: serialStore.getAllSerial(),
                code: response.data[0].code,
            });
        }
        serialStore.clearSerial();
    });
});

port.on('error', function (err) {
    logger.error(err.toString());
});

port.on('open', function () {
    logger.info("Serial Port opened")
    axios.get(process.env.JSON_SERVER + '/uploads?queue_position=0&demo_completed=false').then(function (response) {
        if (response.data.length > 0) {
            serialStore.setRunningSketch(response.data[0].code, response.data[0].user);
        }
    });
});

parser.on('data', (data) => {
    serialStore.addSerial(data);
    global[uuid].io.to(serialStore.getSketchUser()).emit("senseboxSerial", serialStore.getAllSerial());
});

const cronJob = new CronJob('20 0/2 * * * *', function () {
    axios.get(process.env.JSON_SERVER + '/uploads?demo_completed=false&_order=queue_position').then(async function (response) {
        if (response.data.length > 0) {
            if (!port.isOpen) {
                await port.open();
            }
        }
    })
        .catch(function (error) {
            logger.error(error.toString());
        });
}, null, true, 'America/Los_Angeles');

module.exports = cronJob;
