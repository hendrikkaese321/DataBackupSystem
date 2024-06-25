const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

require('dotenv').config();

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const RESTORE_DIR = process.env.RESTORE_DIR || './data';

function logError(operation, err) {
  console.error(`[${new Date().toISOString()}] - An error occurred during ${operation}. Detailed info: ${err.message}`, err);
}

function enhanceErrorMessage(operation, originalError) {
  return new Error(`An error occurred during ${operation}: ${originalError.message}`);
}

const backupRestoreService = {
  listBackups: async function () {
    try {
      const files = await readdir(BACKUP_DIR);
      return files.filter(file => file.endsWith('.json')); 
    } catch (err) {
      logError('listing backups', err);
      throw enhanceErrorMessage('listing backups', err);
    }
  },

  fetchBackupData: async function (fileName) {
    const filePath = path.join(BACKUP_DIR, fileName);
    try {
      const data = await readFile(filePath, 'utf8');
      return JSON.parse(data); 
    } catch (err) {
      logError('fetching backup data', err);
      throw enhanceErrorMessage('fetching backup data from ' + filePath, err);
    }
  },

  restoreData: async function (fileName, data) {
    const restorePath = path.join(RESTORE_DIR, fileName);
    try {
      const dataString = JSON.stringify(data, null, 2);
      await writeFile(restorePath, dataToBackup);
      console.log(`[${new Date().toISOString()}] - Successfully restored data to ${restorePath}`);
    } catch (err) {
      logError(`restoring data to ${restorePath}`, err);
      throw enhanceErrorMessage(`restoring data to ${restorePath}`, err);
    }
  }
};

module.exports = backupRestoreService;