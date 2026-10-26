const crypto = require('crypto');
const { readJSON, writeJSON } = require('../config/db');

const BLOGS_FILE = 'blogs.json';

function parseTags(tags) {
    if (Array.isArray(tags)) {
        return tags.map(function (t) { return t.trim(); }).filter(Boolean);
    }
    if (typeof tags === 'string') {
        return tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    }
    return [];
}

function findBlogById(id) {
    const blogs = readJSON(BLOGS_FILE);
    return blogs.find(b => b.id === id) || null;
}

function findBlogsByAuthor(authorId) {
    const blogs = readJSON(BLOGS_FILE);
    return blogs.filter(b => b.author === authorId);
}

function getPublishedBlogs() {
    const blogs = readJSON(BLOGS_FILE);
    return blogs.filter(b => b.status === 'published');
}

async function createBlog(blogData) {
    const blogs = readJSON(BLOGS_FILE);

    const blog = {
        id: crypto.randomUUID(),
        title: blogData.title.trim(),
        category: blogData.category,
        tags: parseTags(blogData.tags),
        thumbnail: blogData.thumbnail || '',
        content: blogData.content.trim(),
        excerpt: blogData.excerpt || '',
        status: blogData.status || 'draft',
        author: blogData.author,
        authorName: blogData.authorName,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    blogs.push(blog);
    writeJSON(BLOGS_FILE, blogs);
    return blog;
}

async function updateBlog(id, updates) {
    const blogs = readJSON(BLOGS_FILE);
    const index = blogs.findIndex(b => b.id === id);
    if (index === -1) {
        const err = new Error('Blog not found');
        err.code = 'BLOG_NOT_FOUND';
        throw err;
    }

    const { title, category, tags, thumbnail, content, excerpt, status, views } = updates;
    if (title !== undefined) blogs[index].title = title.trim();
    if (category !== undefined) blogs[index].category = category;
    if (tags !== undefined) blogs[index].tags = parseTags(tags);
    if (thumbnail !== undefined) blogs[index].thumbnail = thumbnail;
    if (content !== undefined) blogs[index].content = content.trim();
    if (excerpt !== undefined) blogs[index].excerpt = excerpt;
    if (status !== undefined) blogs[index].status = status;
    if (views !== undefined) blogs[index].views = views;
    blogs[index].updatedAt = new Date().toISOString();

    writeJSON(BLOGS_FILE, blogs);
    return blogs[index];
}

async function deleteBlog(id) {
    const blogs = readJSON(BLOGS_FILE);
    const index = blogs.findIndex(b => b.id === id);
    if (index === -1) return false;
    blogs.splice(index, 1);
    writeJSON(BLOGS_FILE, blogs);
    return true;
}

async function uploadImage(buffer, filename, contentType) {
    // Store images locally in data/images directory
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(__dirname, '..', 'data', 'images');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const ext = filename.split('.').pop() || 'jpg';
    const baseName = filename.split('.').slice(0, -1).join('.') || 'image';
    const storedName = baseName + '-' + Date.now() + '.' + ext;
    const filepath = path.join(dataDir, storedName);

    fs.writeFileSync(filepath, buffer);
    return {
        path: filepath,
        url: '/data/images/' + storedName
    };
}

module.exports = {
    findBlogById,
    findBlogsByAuthor,
    getPublishedBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    uploadImage,
    parseTags
};