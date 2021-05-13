const axios = require('axios').default;
const crypto = require('crypto');
const ioUpdateQueue = require('./websockets/updateQueue');
const ioUpdatePrivate = require('./websockets/updatePrivate');

function updateItem(item, { queue_position, uploaded, demo_completed, error, serial }) {
    axios.put(process.env.JSON_SERVER + '/uploads/' + item.id, {
        sketch: item.sketch,
        xml: item.xml,
        queue_position: queue_position,
        friendly_name: item.friendly_name,
        user: item.user,
        updated: item.updated,
        uploaded: uploaded ? uploaded : item.uploaded,
        demo_completed: demo_completed ? demo_completed : item.demo_completed,
        error: error ? error : item.error,
        serial: serial ? serial : item.serial,
        code: item.code
    });
    ioUpdateQueue();
    ioUpdatePrivate(item.user);
}

async function addItem(sketch, xml = null, friendly_name, user) {
    var queuePosition = 1;
    await axios.get(process.env.JSON_SERVER + '/uploads').then(function (response) {
        for (const test of response.data) {
            if (test.queue_position != 0) {
                queuePosition++;
            }
        }
    });
    axios.post(process.env.JSON_SERVER + '/uploads', {
        sketch: sketch,
        xml: xml,
        queue_position: queuePosition,
        friendly_name: friendly_name,
        user: user,
        updated: Date.now(),
        uploaded: 0,
        demo_completed: false,
        error: null,
        serial: null,
        code: crypto.randomBytes(16).toString('hex'),
    });
    ioUpdateQueue();
    ioUpdatePrivate(user);
}
module.exports.updateItem = updateItem;
module.exports.addItem = addItem;