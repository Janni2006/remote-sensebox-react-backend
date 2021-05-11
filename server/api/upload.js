const express = require('express');
const crypto = require('crypto');
const axios = require('axios').default;
const uploadRouter = express.Router();
const db = require('../database');

uploadRouter.get("/upload", (req, res) => {
    console.log(req.headers.sessionid);
    res.send(JSON.stringify(req.session));
});

uploadRouter.post("/upload", async function (req, res) {
    const sketch = req.body.sketch;
    const sketch_name = req.body.sketch_name;
    const blockly_xml = req.body.sketch_xml;

    const workshop_id = req.body.workshop_id;
    await db.addItem(sketch, blockly_xml, sketch_name, req.headers.sessionid);
    res.status(200).send("uploaded")
});

module.exports = uploadRouter;