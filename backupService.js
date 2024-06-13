const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
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
    const compressedBackupFileName = `${backupFileName}.gz`;
    const backupFilePath = path.join(this.backupDirectory, backupFileName);
    const compressedBackupFilePath = path.join(this.backupDirectory, compressedBackupFileName);

    fs.writeFile(backupFilePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error(`Failed to save backup: ${backupFileName}`, err);
        if(callback) callback(err);
        return;
      }

      // Compress the backup file after writing
      const readStream = fs.createReadStream(backupFilePath);
      const writeStream = fs.createWriteStream(compressedBackupFilePath);
      const gzip = zlib.createGzip();

      readStream.pipe(gzip).pipe(writeStream).on('finish', (err) => {
        if (err) {
          console.error(`Failed to compress backup: ${compressedBackupFileName}`, err);
          if(callback) callback(err);
          return;
        }
        fs.unlink(backupFilePath, () => { // Clean up uncompressed file
          console.log(`Backup compressed and saved: ${compressedBackupFileName}`);
          if(callback) callback(null, compressedBackupFileName);
        });
      });
    });
  }

  restoreBackup(backupFileName, callback) {
    const backupFilePath = path.join(this.backupDirectory, backupFileName);
    const decompressedBackupFileName = backupFileName.replace('.gz', '');
    const decompressedBackupFilePath = path.join(this.backupDirectory, decompressedBackupFileName);
    const readStream = fs.createReadStream(backupFilePath);
    const writeStream = fs.createWriteStream(decompressedBackupFilePath);
    const gunzip = zlib.createGunzip();

    readStream.pipe(gunzip).pipe(writeStream).on('finish', (err) => {
      if (err) {
        console.error(`Failed to restore backup: ${backupFileName}`, err);
        if(callback) callback(err);
        return;
      }

      console.log(`Backup restored: ${decompressedBackupFileName}`);
      if(callback) callback(null, decompressedBackupFileName);
    });
  }

  deleteBackup(backupFileName, callback) {
    const backupFilePath = path.join(this.backupDirectory, backupFileName);
    fs.unlink(backupFilePath, (err) => {
      if (err) {
        console.error(`Failed to delete backup: ${backupFileName}`, err);
        if(callback) callback(err);
        return;
      }
      console.log(`Backup deleted: ${backupFileName}`);
      if(callback) callback(null, backupFileName);
    });
  }

  listBackups(keyword = '') {
    fs.readdir(this.backupDirectory, (err, files) => {
      if (err) {
        console.error('Failed to list backup files', err);
        return;
      }

      const filteredFiles = files.filter(file => file.includes(keyword));
      console.log('Backup files:', filteredFiles);
    });
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
}

module.exports = BackupService;