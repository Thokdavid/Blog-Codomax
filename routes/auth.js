const express = require('express');
const router = express.Router();

const { createUser, authenticateUser, generateToken } = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, username, password } = req.body;

        if (!firstName || !lastName || !email || !username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const user = await createUser({ firstName, lastName, email, username, password });
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user
        });
    } catch (err) {
        if (err.code === 'EMAIL_EXISTS' || err.code === 'USERNAME_EXISTS') {
            return res.status(409).json({ error: err.message });
        }
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await authenticateUser(email, password);
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user
        });
    } catch (err) {
        if (err.code === 'INVALID_CREDENTIALS') {
            return res.status(401).json({ error: err.message });
        }
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
