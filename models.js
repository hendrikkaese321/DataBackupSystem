const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

const backupSchema = new mongoose.Schema({
    backupId: String,
    timestamp: Date,
    source: String,
    status: String
});

const Backup = mongoose.model('Backup', backupSchema);

async function addBackup(backupData) {
    try {
        const backup = new Backup({
            ...backupData,
            timestamp: new Date(backupData.timestamp),
        });
        const result = await backup.save();
        console.log(result);
    } catch (err) {
        console.error('Failed to add backup', err);
    }
}

async function getBackup(backupId) {
    try {
        return await Backup.findOne({ backupId });
    } catch (err) {
        console.error(`Failed to retrieve backup with ID ${backupId}`, err);
    }
}

async function updateBackupStatus(backupId, status) {
    try {
        const result = await Backup.updateOne({ backupId }, { status });
        console.log(result);
    } catch (err) {
        console.error(`Failed to update status for backup ID ${backupId}`, err);
    }
}

async function deleteBackup(backupId) {
    try {
        const result = await Backup.deleteOne({ backupId });
        console.log(`Backup with ID ${backupId} deleted successfully.`);
    } catch (err) {
        console.error(`Failed to delete backup with ID ${backupId}`, err);
    }
}

module.exports = { addBackup, getBackup, updateBackupStatus, deleteBackup };