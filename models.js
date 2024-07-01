const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const backupSchema = new mongoose.Schema({
  backupId: String,
  timestamp: Date,
  source: String,
  status: String
});

const Backup = mongoose.model('Backup', backupSchema);

async function addBackup({ backupId, timestamp, source, status }) {
  const backup = newBackup({
    backupId,
    timestamp: new Date(timestamp),
    source,
    status
  });
  const result = await backup.save();
  console.log(result);
}

async function getBackup(backupId) {
  return await Backup.findOne({ backupId });
}

async function updateBackupStatus(backupId, status) {
  const result = await Backup.updateOne({ backupId }, { $set: { status } });
  console.log(result);
}

module.exports = { addBackup, getBackup, updateBackupStatus };