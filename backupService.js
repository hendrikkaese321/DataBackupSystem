const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const nodeCron = require('node-cron');

require('dotenv').config();

class BackupService {
  constructor() {
    this.backupDirectoryPath = process.env.BACKUP_DIR || path.join(__dirname, 'backups');
    this.createBackupDirectoryIfNeeded();
  }

  createBackupDirectoryIfNeeded() {
    if (!fs.existsSync(this.backupDirectoryPath)) {
      fs.mkdirSync(this.backupDirectoryPath, {recursive: true});
    }
  }

  performBackup(data, onComplete) {
    const currentTimeStamp = new Date().toISOString();
    const backupFileName = `backup-${currentTimeStamp}.json`;
    const compressedBackupFileName = `${backupFileName}.gz`;
    const backupFilePath = path.join(this.backupDirectoryPath, backupFileName);
    const compressedBackupFilePath = path.join(this.backupDirectoryPath, compressedBackupFileName);

    fs.writeFile(backupFilePath, JSON.stringify(data, null, 2), (writeError) => {
      if (writeError) {
        console.error(`Failed to save backup: ${backupFileName}`, writeError);
        if(onComplete) onComplete(writeError);
        return;
      }

      // Compress the just-saved backup file
      const readFileStream = fs.createReadStream(backupFilePath);
      const gzipWriteStream = fs.createWriteStream(compressedBackupFilePath);
      const gzip = zlib.createGzip();

      readFileStream.pipe(gzip).pipe(gzipWriteStream).on('finish', (compressionError) => {
        if (compressionError) {
          console.error(`Failed to compress backup: ${compressedBackupFileName}`, compressionError);
          if(onComplete) onComplete(compressionError);
          return;
        }
        fs.unlink(backupFilePath, () => { // Remove the uncompressed file after compression
          console.log(`Backup compressed and saved: ${compressedBackupFileName}`);
          if(onComplete) onComplete(null, compressedBackupFileName);
        });
      });
    });
  }

  restoreBackup(backupFileNameForRestore, onComplete) {
    const backupFilePath = path.join(this.backupDirectoryPath, backupFileNameForRestore);
    const restoredBackupFileName = backupFileNameForRestore.replace('.gz', '');
    const restoredBackupFilePath = path.join(this.backupDirectoryPath, restoredBackupFileName);
    const readFileStream = fs.createReadStream(backupFilePath);
    const writeStreamForRestore = fs.createWriteStream(restoredBackupFilePath);
    const gunzip = zlib.createGunzip();

    readFileStream.pipe(gunzip).pipe(writeStreamForRestore).on('finish', (restoreError) => {
      if (restoreError) {
        console.error(`Failed to restore backup: ${backupFileNameForRestore}`, restoreError);
        if(onComplete) onComplete(restoreError);
        return;
      }

      console.log(`Backup restored: ${restoredBackupFileName}`);
      if(onComplete) onComplete(null, restoredBackupFileName);
    });
  }

  deleteBackupFile(backupFileNameToDelete, onComplete) {
    const backupFilePath = path.join(this.backupDirectoryPath, backupFileNameToDelete);
    fs.unlink(backupFilePath, (deletionError) => {
      if (deletionError) {
        console.error(`Failed to delete backup: ${backupFileNameToDelete}`, deletionError);
        if(onComplete) onComplete(deletionError);
        return;
      }
      console.log(`Backup deleted: ${backupFileNameToDelete}`);
      if(onComplete) onComplete(null, backupFileNameToDelete);
    });
  }

  searchAndListBackups(searchKeyword = '') {
    fs.readdir(this.backupDirectoryPath, (error, backupFiles) => {
      if (error) {
        console.error('Failed to list backup files', error);
        return;
      }

      const matchingBackupFiles = backupFiles.filter(file => file.includes(searchKeyword));
      console.log('Filtered backup files:', matchingBackupFiles);
    });
  }

  scheduleBackupCreation(cronSyntax, backupData) {
    if (!nodeCron.validate(cronSyntax)) {
      console.error(`Invalid cron syntax for scheduling backup: ${cronSyntax}`);
      return;
    }

    nodeCron.schedule(cronSyntax, () => {
      console.log('Initiating scheduled backup...');
      this.performBackup(backupData, (backupError, backupFileName) => {
        if (backupError) {
          console.error('Failed to create backup according to schedule');
          return;
        }
        console.log(`Scheduled backup successfully created: ${backupFileName}`);
      });
    });
  }
}

module.exports = BackupService;