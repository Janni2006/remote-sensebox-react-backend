const axios = require('axios').default;
const uuid = require('../uuid');

module.exports = (userID) => {
    axios.get(`${process.env.JSON_SERVER}/uploads?user=${userID}&_sort=id&_order=desc`).then(function (response) {
        var data = [];

        for (const sketch of response.data) {
            data.push({
                blockly: sketch.xml === "" || sketch.xml === null ? false : true,
                finished: sketch.demo_completed ? sketch.error === null ? true : false : false,
                running: sketch.demo_completed ? false : sketch.uploaded > 0 ? true : false,
                error: sketch.error === null ? false : true,
                friendly_name: sketch.friendly_name,
                code: sketch.code,
            });
        }
        global[uuid].io.to(userID).emit("privateSketches", data);
    })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
}