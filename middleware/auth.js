const jwt = require('jsonwebtoken');
const { findUserById, JWT_SECRET } = require('../models/User');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = findUserById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token - user not found' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { authenticateToken };
