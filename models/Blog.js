const crypto = require('crypto');
const { readJSON, writeJSON } = require('../config/db');

const BLOGS_FILE = 'blogs.json';

function findBlogById(id) {
    const blogs = readJSON(BLOGS_FILE);
    return blogs.find(b => b.id === id);
}

function findBlogsByAuthor(authorId) {
    const blogs = readJSON(BLOGS_FILE);
    return blogs
        .filter(b => b.author === authorId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getPublishedBlogs() {
    const blogs = readJSON(BLOGS_FILE);
    return blogs
        .filter(b => b.status === 'published')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function parseTags(tags) {
    if (Array.isArray(tags)) {
        return tags.map(t => t.trim()).filter(Boolean);
    }
    if (typeof tags === 'string') {
        return tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
}

function createBlog({ title, category, tags, thumbnail, content, excerpt, status, author, authorName }) {
    const blogs = readJSON(BLOGS_FILE);

    const blog = {
        id: crypto.randomUUID(),
        title: title.trim(),
        category,
        tags: parseTags(tags),
        thumbnail: thumbnail || '',
        content: content.trim(),
        excerpt: excerpt || '',
        status: status || 'draft',
        author,
        authorName,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    blogs.push(blog);
    writeJSON(BLOGS_FILE, blogs);

    return blog;
}

function updateBlog(id, updates) {
    const blogs = readJSON(BLOGS_FILE);
    const index = blogs.findIndex(b => b.id === id);
    if (index === -1) return null;

    const updated = { ...blogs[index], ...updates, updatedAt: new Date().toISOString() };
    blogs[index] = updated;
    writeJSON(BLOGS_FILE, blogs);

    return updated;
}

function deleteBlog(id) {
    const blogs = readJSON(BLOGS_FILE);
    const index = blogs.findIndex(b => b.id === id);
    if (index === -1) return false;

    blogs.splice(index, 1);
    writeJSON(BLOGS_FILE, blogs);
    return true;
}

function toSafe(blog) {
    return blog;
}

module.exports = {
    findBlogById,
    findBlogsByAuthor,
    getPublishedBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    toSafe
};
