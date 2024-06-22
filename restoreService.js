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
  console.log(`[${new Date().toISOString()}] - Error during ${operation}: ${err.message}`);
}

const backupRestoreService = {
  listBackups: async function () {
    try {
      const files = await readdir(BACKUP_DIR);
      return files.filter(file => file.endsWith('.json')); 
    } catch (err) {
      logError('listing backups', err);
      // Depending on requirements, you could decide to return an empty list or re-throw the error
      throw new Error(`Error listing backups: ${err.message}`);
    }
  },

  fetchBackupData: async function (fileName) {
    const filePath = path.join(BACKUP_DIR, fileName);
    try {
      const data = await readFile(filePath, 'utf8');
      return JSON.parse(data); 
    } catch (err) {
      logError('fetching backup data', err);
      throw new Error(`Error fetching backup data: ${err.message}`);
    }
  },

  restoreData: async function (fileName, data) {
    const restorePath = path.join(RESTORE_DIR, fileName); // Fixed RESTORE -> RESTORE_DIR
    try {
      const dataString = JSON.stringify(data, null, 2);
      await writeFile(restorePath, dataString);
      console.log(`Successfully restored data to ${restorePath}`);
    } catch (err) {
      logError('restoring data', err);
      throw new Error(`Error restoring data: ${err.message}`);
    }
  }
};

module.exports = backupRestoreService;