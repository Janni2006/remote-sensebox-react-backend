const express = require('express');
const camRouter = express.Router();

camRouter.get('/initial', (req, res) => {
    res.json({ camUrl: process.env.CAMURL, baudeRate: parseInt(process.env.SERIAL_RATE) })
});

module.exports = camRouter;