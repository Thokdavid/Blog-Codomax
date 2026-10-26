require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname), { dotfiles: 'deny' }));

const { supabase } = require('./config/supabase');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));

app.get('/api/health', async (req, res) => {
    let dbStatus = 'unknown';
    try {
        const { error } = await supabase.from('blogs').select('id').limit(1);
        dbStatus = error ? 'error: ' + error.message : 'connected';
    } catch (e) {
        dbStatus = 'error: ' + e.message;
    }
    res.json({ status: 'OK', timestamp: new Date().toISOString(), database: dbStatus });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Conditional listen: only start server when run directly (not when imported)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Frontend: http://localhost:${PORT}`);
        console.log(`API: http://localhost:${PORT}/api`);
    });
}

module.exports = { app };
