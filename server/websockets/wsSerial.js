const uuid = require('../uuid');

module.exports = (userID, serialData) => {
    console.log("serial!");
    global[uuid].io.to(userID).emit("senseboxSerial", serialData);
}