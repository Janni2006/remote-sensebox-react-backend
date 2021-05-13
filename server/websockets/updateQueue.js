const axios = require('axios').default;
const uuid = require('../uuid');

module.exports = () => {
    axios.get(process.env.JSON_SERVER + '/uploads?demo_completed=false&_order=queue_position').then(function (response) {

        const queue = [];

        if (response.data.length > 0) {
            for (const item of response.data) {
                if (!item.demo_completed && !item.error) {
                    var progress = Date.now() - item.uploaded;
                    progress = (progress / process.env.SKETCH_RUNTIME) * 100;
                    progress = progress > 100 ? 100 : progress;
                    var time_left = item.uploaded ? process.env.SKETCH_RUNTIME * (100 - progress) : process.env.SKETCH_RUNTIME;

                    queue.current_wait = queue.current_wait + time_left;
                    queue.push({
                        id: item.id,
                        friendly_name: item.friendly_name,
                        user: item.user,
                        running: item.queue_position == 0,
                        queue_position: item.queue_position,
                        progress: item.queue_position == 0 ? Math.round(progress) : 0
                    });
                }
            }
        }
        global[uuid].io.emit("queueUpdate", queue);
    })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
}