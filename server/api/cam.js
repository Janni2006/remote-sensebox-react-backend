const express = require('express');
const camRouter = express.Router();
const fs = require('fs');

camRouter.get('/cam', (req, res) => {
    res.json({ camUrl: process.env.CAMURL })
});

module.exports = camRouter;