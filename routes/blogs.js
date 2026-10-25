const express = require('express');
const router = express.Router();

const {
    createBlog,
    findBlogById,
    findBlogsByAuthor,
    getPublishedBlogs,
    updateBlog,
    deleteBlog,
    uploadImage
} = require('../models/Blog');
const { authenticateToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const blogs = await getPublishedBlogs();
        res.json(blogs);
    } catch (err) {
        console.error('Error fetching blogs:', err.message);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

router.get('/user', authenticateToken, async (req, res) => {
    try {
        const blogs = await findBlogsByAuthor(req.user.id);
        res.json(blogs);
    } catch (err) {
        console.error('Error fetching user blogs:', err.message);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const blog = await findBlogById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    } catch (err) {
        console.error('Error fetching blog:', err.message);
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, category, tags, thumbnail, content, excerpt, status } = req.body;

        if (!title || !category || !content) {
            return res.status(400).json({ error: 'Title, category, and content are required' });
        }

        const blog = await createBlog({
            title,
            category,
            tags,
            thumbnail,
            content,
            excerpt,
            status: status || 'published',
            author: req.user.id,
            authorName: req.user.firstName + ' ' + req.user.lastName
        });

        res.status(201).json({
            message: 'Blog created successfully',
            blog
        });
    } catch (err) {
        console.error('Blog creation error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to create blog' });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const blog = await findBlogById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.author !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to edit this blog' });
        }

        const updated = await updateBlog(req.params.id, req.body);
        res.json({ message: 'Blog updated successfully', blog: updated });
    } catch (err) {
        console.error('Blog update error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to update blog' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const blog = await findBlogById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.author !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this blog' });
        }

        await deleteBlog(req.params.id);
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error('Blog deletion error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to delete blog' });
    }
});

router.post('/upload-image', authenticateToken, async (req, res) => {
    try {
        const { imageData, filename, contentType } = req.body;

        if (!imageData || !filename) {
            return res.status(400).json({ error: 'Image data and filename are required' });
        }

        const buffer = Buffer.from(imageData, 'base64');

        const result = await uploadImage(buffer, filename, contentType);

        res.status(200).json({
            message: 'Image uploaded successfully',
            url: result.url,
            path: result.path
        });
    } catch (err) {
        console.error('Image upload error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to upload image' });
    }
});

module.exports = router;
