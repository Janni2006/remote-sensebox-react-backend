const express = require('express');
const apiRouter = express.Router();

const uploadRouter = require('./upload');
const queueRouter = require('./queue');
const sketchRouter = require('./sketches');
const workshopRouter = require('./workshop');
const initialRouter = require('./initial');

apiRouter.use("/", uploadRouter);
apiRouter.use("/", queueRouter);
apiRouter.use("/", sketchRouter);
apiRouter.use("/", workshopRouter);
apiRouter.use("/", initialRouter);

module.exports = apiRouter;