const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readDirectory = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

require('dotenv').config();

const BACKUP_DIRECTORY = process.env.BACKUP_DIR || './backups';
const RESTORE_DIRECTORY = process.env.RESTORE_DIR || './data';

function logErrorWithTimestamp(operation, err) {
  console.error(`[${new Date().toISOString()}] - An error occurred during ${operation}. Detailed info: ${err.message}`, err);
}

function craftEnhancedErrorMessage(operation, originalError) {
  return new Error(`An error occurred during ${operation}: ${originalError.message}`);
}

const backupRestoreManager = {
  listAvailableBackups: async function () {
    try {
      const filesInBackupDir = await readDirectory(BACKUP_DIRECTORY);
      return filesInBackupDir.filter(file => file.endsWith('.json'));
    } catch (err) {
      logErrorWithTimestamp('listing backups', err);
      throw craftEnhancedErrorMessage('listing backups', err);
    }
  },

  readBackupFile: async function (backupFileName) {
    const backupFilePath = path.join(BACKUP_DIRECTORY, backupFileName);
    try {
      const backupContent = await readFileAsync(backupFilePath, 'utf8');
      return JSON.parse(backupContent);
    } catch (err) {
      logErrorWithTimestamp('reading backup file', err);
      throw craftEnhancedErrorMessage('reading backup file from ' + backupFilePath, err);
    }
  },

  performRestore: async function (restoreFileName, restoreData) {
    const targetRestorePath = path.join(RESTORE_DIRECTORY, restoreFileName);
    try {
      const dataAsString = JSON.stringify(restoreData, null, 2);
      await writeFileAsync(targetRestorePath, dataAsString);
      console.log(`[${new Date().toISOString()}] - Successfully restored data to ${targetRestorePath}`);
    } catch (err) {
        logErrorWithTimestamp(`restoring data to ${targetRestorePath}`, err);
        throw craftEnhancedErrorMessage(`restoring data to ${targetRestorePath}`, err);
    }
  }
};

module.exports = backupRestoreManager;