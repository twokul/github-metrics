import winston from 'winston';

const { format } = winston;

const alignedWithColorsAndTime = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf(
    (info: any) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const level = process.env.LOG_LEVEL || 'debug';

const logger = winston.createLogger({
  format: alignedWithColorsAndTime,
  level,
  transports: [new winston.transports.Console()],
});

export default logger;
