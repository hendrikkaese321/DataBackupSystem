const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

require('dotenv').config();

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const RESTORE_DIR = process.env.RESTORE_DIR || './data';

const backupRestoreService = {
  listBackups: async function () {
    try {
      const files = await readdir(BACKUP_DIR);
      return files.filter(file => file.endsWith('.json')); 
    } catch (err) {
      throw new Error(`Error listing backups: ${err.message}`);
    }
  },

  fetchBackupData: async function (fileName) {
    const filePath = path.join(BACKUP_DIR, fileName);
    try {
      const data = await readFile(filePath, 'utf8');
      return JSON.parse(data); 
    } catch (err) {
      throw new Error(`Error fetching backup data: ${err.message}`);
    }
  },

  restoreData: async function (fileName, data) {
    const restorePath = path.join(RESTORE, fileName);
    try {
      const dataString = JSON.stringify(data, null, 2);
      await writeFile(restorePath, dataString);
      console.log(`Successfully restored data to ${restorePath}`);
    } catch (err) {
     throw new Error(`Error restoring data: ${err.message}`);
    }
  }
};

module.exports = backupRestoreService;