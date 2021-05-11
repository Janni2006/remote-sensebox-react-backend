const express = require('express');
const sketchRouter = express.Router();
const axios = require('axios').default;

sketchRouter.get('/private-sketches', (req, res) => {
    axios.get(`${process.env.JSON_SERVER}/uploads?user=${req.headers.sessionid}&_sort=id&_order=desc`).then(function (response) {
        var data = [];

        for (const sketch of response.data) {
            data.push({
                blockly: sketch.xml === null ? false : true,
                finished: sketch.demo_completed ? sketch.error === null ? true : false : false,
                error: sketch.error === null ? false : true,
                friendly_name: sketch.friendly_name,
                code: sketch.code,
            });
        }
        res.json(data);
    })
        .catch(function (error) {
            // handle error
            res.status(500).json(error)
        });
});

sketchRouter.get('/sketch/:sketchID', function (req, res) {
    const sketchID = req.params.sketchID;
    if (sketchID) {
        axios.get(`${process.env.JSON_SERVER}/uploads?code=${sketchID}`).then(function (response) {
            if (response.data.length > 1) {
                return res.status(500).send({
                    message: "There are multiple sketches with his ID"
                });
            }
            if (response.data.length == 0) {
                return res.status(404).send({
                    message: "Sketch not found"
                });
            }
            // if (response.data[0].user == req.keaders.deviceid) {
            const data = {
                xml: response.data[0].xml,
                sketch: response.data[0].sketch,
                blockly: response.data[0].xml === null ? false : true,
                error: response.data[0].error === null ? false : true,
                error_msg: response.data[0].error,
                serial: response.data[0].serial,
                title: response.data[0].friendly_name,
                code: response.data[0].code,
                finished: response.data[0].demo_completed ? response.data[0].error === null ? true : false : false,
            }
            res.json(data);
            // } else {
            //     return res.status(403).send({
            //         message: "Permission denied"
            //     });
            // }
        })
            .catch(function (error) {
                // handle error
                res.status(500).json(error)
            });
    } else {
        return res.status(400).send({
            message: "No sketchID provided"
        });
    }
});

module.exports = sketchRouter;