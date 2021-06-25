const deleteHandler = require("./deleteHandler");
const flashHandler = require("./flashHandler");
const serialHandler = require("./serialHandler");
const cameraHandler = require("./cameraHandler");

function startJobs() {
    deleteHandler.start();
    flashHandler.start();
    serialHandler.start();
    cameraHandler.start();
}

module.exports = startJobs;