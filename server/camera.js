const CronJob = require('cron').CronJob;
const { StreamCamera, Codec } = require("pi-camera-connect");
const fs = require('fs');
const uuid = require('./uuid');
const shell = require('shelljs');
const ffmpeg = require("fluent-ffmpeg");


class Camera {
    constructor(FPS) {
        this.FPS = FPS;
        this.streamCamera = new StreamCamera({
            codec: Codec.MJPEG,
            width: 1280,
            height: 720,
            bitRate: 7500000,
            fps: this.FPS
        });
    }
    async start() {
        await this.streamCamera.startCapture();
        setInterval(() => {
            this.streamCamera.takeImage()
                .then((image) => {
                    global[uuid].io.emit(
                        'video',
                        `data:image/png;base64,${Buffer.from(image).toString('base64')}`
                    );
                });
        }, 1000 / this.FPS);
    }

    start_cronJob() {
        const cronJob = new CronJob('0/2 * * * *', async () => {
            const videoStream = this.streamCamera.createStream();
            const dir = `${__basedir}/videos/${Math.round(Date.now() / 1000) * 1000}.mjpeg`;
            const writeStream = fs.createWriteStream(dir);

            const videos = fs.readdirSync(__basedir + '/videos/');

            let finished = false;
            for (var i = 0; i < videos.length; i++) {
                if (videos[i].split(".")[0] <= Date.now() - 1000 * 60 * 10 && videos[i].split(".")[1] == "mjpeg") {
                    shell.exec(`rm ${__basedir}/videos/${videos[i]}`, { async: true, silent: true })
                }
            }

            videoStream.on('data', async (image) => {
                if (!finished) {
                    if (Math.round(cronJob.nextDates(1)[0].unix() - new Date().getTime() / 1000 < 5)) {
                        videoStream.off('data', () => { });
                        finished = true;
                        ffmpeg(dir)
                            .outputOptions("-c:v", "copy")
                            .save(dir.split(".")[0] + ".mp4");
                    } else {
                        writeStream.write(image);
                    }
                }
            });
        }, null, true, 'America/Los_Angeles');
        cronJob.start();
    }
}

module.exports = Camera;
