const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

(function loadEnvVariables() {
  try {
    require('dotenv').config();
  } catch (error) {
    console.error('Failed to load environment variables:', error);
    process.exit(1); 
  }
})();

const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

let logger;

(function initializeLogger() {
  try {
    logger = createLogger({
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
  } catch (error) {
    console.error(`Failed to initialize logger: ${error.message}`);
    process.exit(1); 
  }
})();

function safeLog(level, message) {
  try {
    logger?.log(level, message);
  } catch (error) {
    console.error(`Failed to log message: ${error.message}`);
  }
}

safeLog('info', 'Backup job started');

function performBackup() {
  try {
    const backupFilePath = path.join(__dirname, 'backup.txt');
    fs.writeFileSync(backupFilePath, 'Backup data here');
    safeLog('info', `Backup job finished successfully. Backup created at ${backupPrefixPath}`);
  } catch (error) {
    safeLog('error', `Backup job failed: ${error.message}`);
  }
}

performBackup();

safeLog(performBackup.error ? 'error' : 'warn', 'Backup job completed with some warnings');

module.exports = logger;