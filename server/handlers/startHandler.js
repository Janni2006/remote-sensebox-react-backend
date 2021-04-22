const deleteHandler = require("./deleteHandler");
const flashHandler = require("./flashHandler");
const serialHandler = require("./serialHandler");

function startJobs() {
    deleteHandler.start();
    flashHandler.start();
    serialHandler.start();
}

module.exports = startJobs;