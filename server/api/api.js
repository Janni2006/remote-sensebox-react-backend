const express = require('express');
const apiRouter = express.Router();

const uploadRouter = require('./upload');
const queueRouter = require('./queue');
const sketchRouter = require('./sketches');
const workshopRouter = require('./workshop');
const camRouter = require('./cam');

apiRouter.use("/", uploadRouter);
apiRouter.use("/", queueRouter);
apiRouter.use("/", sketchRouter);
apiRouter.use("/", workshopRouter);
apiRouter.use("/", camRouter);

module.exports = apiRouter;