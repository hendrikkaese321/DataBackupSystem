const fs = require('fs');
const { createLogger, format, transports } = require('winston');
require('dotenv').config();
const { combine, timestamp, label, printf } = format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    label({ label: 'BackupSystem' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.File({ filename: 'backup-system-error.log', level: 'error' }),
    new transports.File({ filename: 'backup-system-combined.log' }),
  ],
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple(),
  }));
}
logger.info('Backup job started');
logger.info('Backup job finished successfully');
logger.warn('Backup job completed with some warnings');
logger.error('Backup job failed');
module.exports = logger;