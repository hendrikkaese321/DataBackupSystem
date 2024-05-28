require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI,
  backupStoragePath: process.env.BACKUP_STORAGE_PATH,
  backupSchedule: '0 0 * * *',
};
