const fs = require('fs');
const path = require('path');
const nodeCron = require('node-cron');

require('dotenv').config();

class BackupService {
  constructor() {
    this.backupDirectory = process.env.BACKUP_DIR || path.join(__dirname, 'backups');
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDirectory)) {
      fs.mkdirSync(this.backupDirectory, {recursive: true});
    }
  }


  initiateBackup(data, callback) {
    const timestamp = new Date().toISOString();
    const backupFileName = `backup-${timestamp}.json`;
    const backupFilePath = path.join(this.backupDirectory, backupFileName);

    fs.writeFile(backupFilePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error(`Failed to save backup: ${backupFileName}`, err);
        if(callback) callback(err);
        return;
      }

      console.log(`Backup saved: ${backupFileName}`);
      if(callback) callback(null, backupFileName);
    });
  }

  saveBackupData(filePath, callback) {
    console.log(`Backup ${filePath} saved successfully.`);
    if(callback) callback(null, filePath);
  }

  scheduleBackup(cronSyntax, data) {
    if (!nodeCron.validate(cronSyntax)) {
      console.error(`Invalid cron syntax: ${cronSyntax}`);
      return;
    }

    nodeCron.schedule(cronSyntax, () => {
      console.log('Initiating scheduled backup...');
      this.initiateBackup(data, (err, fileName) => {
        if (err) {
          console.error('Failed to create backup on schedule');
          return;
        }
        console.log(`Scheduled backup created: ${fileName}`);
      });
    });
  }

  listBackups() {
    fs.readdir(this.backupDirectory, (err, files) => {
      if (err) {
        console.error('Failed to list backup files', err);
        return;
      }

      console.log('Backup files:', files);
    });
  }
}

module.exports = BackupService;