const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJSON, writeJSON } = require('../config/db');

const USERS_FILE = 'users.json';
const BCRYPT_ROUNDS = 10;

const JWT_SECRET = process.env.JWT_SECRET || 'blog_codomax_jwt_secret_2024_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function findUserById(id) {
    const users = readJSON(USERS_FILE);
    return users.find(u => u.id === id);
}

function findUserByEmail(email) {
    const users = readJSON(USERS_FILE);
    return users.find(u => u.email === email.toLowerCase());
}

function findUserByUsername(username) {
    const users = readJSON(USERS_FILE);
    return users.find(u => u.username === username.toLowerCase());
}

async function createUser({ firstName, lastName, email, username, password }) {
    const users = readJSON(USERS_FILE);

    if (findUserByEmail(email)) {
        const err = new Error('An account with this email already exists');
        err.code = 'EMAIL_EXISTS';
        throw err;
    }

    if (findUserByUsername(username)) {
        const err = new Error('This username is already taken');
        err.code = 'USERNAME_EXISTS';
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = {
        id: crypto.randomUUID(),
        firstName,
        lastName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    users.push(user);
    writeJSON(USERS_FILE, users);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

async function authenticateUser(email, password) {
    const user = findUserByEmail(email);
    if (!user) {
        const err = new Error('Invalid email or password');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

module.exports = {
    findUserById,
    findUserByEmail,
    findUserByUsername,
    createUser,
    authenticateUser,
    generateToken,
    JWT_SECRET
};
