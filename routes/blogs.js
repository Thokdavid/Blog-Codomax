const express = require('express');
const router = express.Router();

const { createBlog, findBlogById, findBlogsByAuthor, getPublishedBlogs, updateBlog, deleteBlog } = require('../models/Blog');
const { authenticateToken } = require('../middleware/auth');

router.get('/', (req, res) => {
    const blogs = getPublishedBlogs();
    res.json(blogs);
});

router.get('/user', authenticateToken, (req, res) => {
    const blogs = findBlogsByAuthor(req.user.id);
    res.json(blogs);
});

router.get('/:id', (req, res) => {
    const blog = findBlogById(req.params.id);
    if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
});

router.post('/', authenticateToken, (req, res) => {
    try {
        const { title, category, tags, thumbnail, content, excerpt, status } = req.body;

        if (!title || !category || !content) {
            return res.status(400).json({ error: 'Title, category, and content are required' });
        }

        const blog = createBlog({
            title,
            category,
            tags,
            thumbnail,
            content,
            excerpt,
            status: status || 'published',
            author: req.user.id,
            authorName: `${req.user.firstName} ${req.user.lastName}`
        });

        res.status(201).json({
            message: 'Blog created successfully',
            blog
        });
    } catch (err) {
        console.error('Blog creation error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', authenticateToken, (req, res) => {
    try {
        const blog = findBlogById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.author !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to edit this blog' });
        }

        const updated = updateBlog(req.params.id, req.body);
        res.json({ message: 'Blog updated successfully', blog: updated });
    } catch (err) {
        console.error('Blog update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const blog = findBlogById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.author !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this blog' });
        }

        deleteBlog(req.params.id);
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error('Blog deletion error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
