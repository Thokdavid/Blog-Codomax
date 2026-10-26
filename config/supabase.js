const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';
const bucketName = process.env.SUPABASE_BUCKET || 'blog-images';

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
    console.warn('WARNING: SUPABASE_URL is not configured. Update your .env file.');
}
if (!supabaseKey || supabaseKey === 'your-service-role-key-here') {
    console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is not configured. Update your .env file.');
}

// Set global WebSocket for Node.js 18/20 compatibility on Render
global.WebSocket = WebSocket;

const supabase = createClient(supabaseUrl, supabaseKey);

function toCamelCase(obj) {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map(toCamelCase);
    const result = {};
    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, function (_, char) {
            return char.toUpperCase();
        });
        result[camelKey] = obj[key];
    }
    return result;
}

function toSnakeCase(obj) {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    const result = {};
    for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, function (char) {
            return '_' + char.toLowerCase();
        });
        result[snakeKey] = obj[key];
    }
    return result;
}

module.exports = {
    supabase,
    bucketName,
    toCamelCase,
    toSnakeCase
};
