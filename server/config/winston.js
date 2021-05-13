const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

const root_path = __basedir;

const logger = winston.createLogger({
    level: 'info',
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({
            filename: `${root_path}/logs/error.log`,
            level: 'error',
            format: combine(
                timestamp(),
                myFormat
            ),
        }),
        new winston.transports.File({
            filename: `${root_path}/logs/combined.log`,
            format: combine(
                timestamp(),
                myFormat
            ),
        }),
        new winston.transports.Console({
            format: combine(
                winston.format.colorize(),
                timestamp(),
                myFormat
            ),
        })
    ],
});

module.exports = logger;