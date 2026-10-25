const crypto = require('crypto');
const { supabase, bucketName, toCamelCase, toSnakeCase } = require('../config/supabase');

function parseTags(tags) {
    if (Array.isArray(tags)) {
        return tags.map(function (t) { return t.trim(); }).filter(Boolean);
    }
    if (typeof tags === 'string') {
        return tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    }
    return [];
}

async function findBlogById(id) {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return toCamelCase(data);
}

async function findBlogsByAuthor(authorId) {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('author', authorId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toCamelCase);
}

async function getPublishedBlogs() {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toCamelCase);
}

async function createBlog(blogData) {
    const blog = {
        title: blogData.title.trim(),
        category: blogData.category,
        tags: parseTags(blogData.tags),
        thumbnail: blogData.thumbnail || '',
        content: blogData.content.trim(),
        excerpt: blogData.excerpt || '',
        status: blogData.status || 'draft',
        author: blogData.author,
        author_name: blogData.authorName,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const snake = toSnakeCase(blog);

    const { data, error } = await supabase
        .from('blogs')
        .insert(snake)
        .select()
        .single();

    if (error) throw error;
    return toCamelCase(data);
}

async function updateBlog(id, updates) {
    const snakeUpdates = toSnakeCase(updates);
    delete snakeUpdates.id;
    delete snakeUpdates.created_at;
    snakeUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('blogs')
        .update(snakeUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return toCamelCase(data);
}

async function deleteBlog(id) {
    const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === 'PGRST116') return false;
        throw error;
    }
    return true;
}

async function uploadImage(buffer, filename, contentType) {
    const ext = filename.split('.').pop();
    const baseName = filename.split('.').slice(0, -1).join('.');
    const storedName = baseName + '-' + Date.now() + '.' + ext;

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(storedName, buffer, {
            contentType: contentType || 'image/jpeg',
            upsert: false
        });

    if (error) throw error;

    const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(storedName);

    return {
        path: data.path,
        url: publicData.publicUrl
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
