const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const BACKUP_FILE_EXTENSION = process.env.BACKUP_FILE_EXTENSION || '.json';

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

app.post('/backup', (req, res) => {
    const backupData = JSON.stringify(req.body);
    const timestamp = (new Date()).toLocaleString().replace(/[\/\s,:]/g, '-'); // Improved timestamp format
    const filename = `backup-${timestamp}${BACKUP_FILE_EXTENSION}`;
    const filepath = path.join(BACKUP_DIR, filename);

    fs.writeFile(filepath, backupData, 'utf8', (err) => {
        if (err) {
            console.error('Error creating a backup:', err);
            return res.status(500).send('Error creating a backup');
        }
        res.status(201).send({ message: 'Backup created successfully', filename });
    });
});

app.get('/backup/list', (req, res) => {
    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) {
            console.error('Error listing backup files:', err);
            return res.status(500).send('Error listing backup files');
        }
        res.status(200).send({ files });
    });
});

app.post('/backup/delete', (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).send('Filename is required for deletion');
    }

    const filepath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filepath)) {
        return res.status(404).send('Backup file not found for deletion');
    }

    fs.unlink(filepath, (err) => {
        if (err) {
            console.error('Error deleting the backup file:', err);
            return res.status(500).send('Error deleting the backup file');
        }
        res.status(200).send({ message: 'Backup file deleted successfully', filename });
    });
});

app.post('/restore', (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).send('Filename is required');
    }

    const filepath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filepath)) {
        return res.status(404).send('Backup file not found');
    }

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the backup file:', err);
            return res.status(500).send('Error reading the backup file');
        }
        res.status(200).send({ message: 'Data restored successfully', data: JSON.parse(data) });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});