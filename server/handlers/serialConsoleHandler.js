const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')

const port = new SerialPort('/dev/ttyACM0', { autoOpen: false, baudRate: 9600 })

module.exports = class Serial {
    start() {
        port.open(function (err) {
            if (err) {
                return console.log('Error opening port: ', err.message)
            }
            const lineStream = port.pipe(new Readline())

            lineStream.on('data', console.log);
            console.log("Serial port opened")
        });
    }
    stop() {
        port.close(function (err) {
            if (err) {
                return console.log('Error closing port: ', err.message)
            }
            console.log("Serial port closed")
        });
    }
}