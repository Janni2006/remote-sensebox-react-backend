const express = require('express');
const crypto = require('crypto');
const axios = require('axios').default;
const uploadRouter = express.Router();

uploadRouter.get("/upload", (req, res) => {
    console.log(req.headers.deviceid);
    res.send(JSON.stringify(req.session));
});

uploadRouter.post("/upload", async function (req, res) {
    console.log(req.body);
    const sketch = req.body.sketch;
    const sketch_name = req.body.sketch_name;
    const blockly = req.body.sketch_xml ? true : false;
    const blockly_xml = req.body.sketch_xml;

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
        xml: blockly ? blockly_xml : null,
        queue_position: queuePosition,
        friendly_name: sketch_name,
        user: req.headers.deviceid,
        updated: Date.now(),
        uploaded: 0,
        demo_completed: false,
        code: crypto.randomBytes(16).toString('hex'),
    })
        .then(res.status(200).send('File uploaded!'));

});

module.exports = uploadRouter;