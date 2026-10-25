const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readJSON(filename) {
    const filepath = path.join(dataDir, filename);
    if (!fs.existsSync(filepath)) {
        return [];
    }
    try {
        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error(`Error reading ${filename}:`, err.message);
        return [];
    }
}

function writeJSON(filename, data) {
    const filepath = path.join(dataDir, filename);
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing ${filename}:`, err.message);
        return false;
    }
}

module.exports = { readJSON, writeJSON, dataDir };
