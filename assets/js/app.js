/* Blog Codomax - Main JavaScript */

const API_BASE = window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : 'https://blog-codomax.onrender.com/api';

const auth = {
    getToken() { return localStorage.getItem('blog_codomax_token'); },
    setToken(token) { localStorage.setItem('blog_codomax_token', token); },
    removeToken() { localStorage.removeItem('blog_codomax_token'); },
    getUser() { return JSON.parse(localStorage.getItem('blog_codomax_user') || 'null'); },
    setUser(user) { localStorage.setItem('blog_codomax_user', JSON.stringify(user)); },
    removeUser() { localStorage.removeItem('blog_codomax_user'); },
    isAuthenticated() { return !!this.getToken(); },
    logout() { this.removeToken(); this.removeUser(); },
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': 'Bearer ' + token } : {};
    }
};

async function apiFetch(url, options = {}) {
    const response = await fetch(API_BASE + url, {
        headers: Object.assign({ 'Content-Type': 'application/json' }, auth.getAuthHeader()),
        ...options
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

class BlogCodomax {
    constructor() {
        this.lastEditorNotification = null;
        this.editingBlogId = null;
        this.initNavbar();
        this.initAuthForms();
        if (!this.initAuthState()) return;
        this.initDashboard();
        this.initBlogEditor();
        this.initImageUpload();
        this.initSearch();
        this.initLogout();
        this.loadIndexPosts();
    }

    /* ===== Navbar Mobile Toggle ===== */
    initNavbar() {
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');

        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('open');
                navLinks.classList.toggle('mobile-open');
                document.body.classList.toggle('nav-open');
            });

            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                    navToggle.classList.remove('open');
                    navLinks.classList.remove('mobile-open');
                    document.body.classList.remove('nav-open');
                }
            });

            const navLinkItems = navLinks.querySelectorAll('a');
            navLinkItems.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('open');
                    navLinks.classList.remove('mobile-open');
                    document.body.classList.remove('nav-open');
                });
            });
        }
    }

    /* ===== Auth State Management ===== */
    initAuthState() {
        const user = auth.getUser();
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        const protectedPages = ['dashboard.html', 'create-blog.html'];
        if (protectedPages.includes(currentPage) && !auth.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }

        const authRedirectPages = ['login.html', 'register.html'];
        if (authRedirectPages.includes(currentPage) && auth.isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return false;
        }

        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.firstName + ' ' + user.lastName;
            }

            const userAvatarEl = document.getElementById('userAvatar');
            if (userAvatarEl) {
                userAvatarEl.textContent = user.firstName.charAt(0) + user.lastName.charAt(0);
            }

            const userFullNameEl = document.getElementById('userFullName');
            if (userFullNameEl) {
                userFullNameEl.textContent = user.firstName + ' ' + user.lastName;
            }

            const userJoinDateEl = document.getElementById('userJoinDate');
            if (userJoinDateEl && user.createdAt) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const joinDate = new Date(user.createdAt);
                const month = monthNames[joinDate.getMonth()];
                const year = joinDate.getFullYear();
                userJoinDateEl.textContent = 'Writer & Blogger • Joined ' + month + ' ' + year;
            }
        }

        return true;
    }

    initLogout() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const protectedPages = ['dashboard.html', 'create-blog.html'];
        if (!protectedPages.includes(currentPage)) return;

        const authBtns = document.querySelector('.auth-btns');
        if (!authBtns) return;
        if (authBtns.querySelector('#logoutBtn')) return;

        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'btn btn-outline';
        logoutBtn.id = 'logoutBtn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.marginLeft = '0.5rem';
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
            window.location.href = 'login.html';
        });
        authBtns.appendChild(logoutBtn);
    }

    /* ===== Search ===== */
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        const postGrid = document.getElementById('postGrid');
        let postCards = [];

        if (postGrid) {
            postCards = postGrid.querySelectorAll('.post-card');
        }

        if (searchInput && postGrid) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                postCards.forEach(card => {
                    const title = card.querySelector('.post-title').textContent.toLowerCase();
                    const excerpt = card.querySelector('.post-excerpt').textContent.toLowerCase();
                    const author = card.querySelector('.author').textContent.toLowerCase();

                    if (title.includes(searchTerm) || excerpt.includes(searchTerm) || author.includes(searchTerm)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });

            const categoryTags = document.querySelectorAll('.category-tag');
            categoryTags.forEach(tag => {
                tag.addEventListener('click', () => {
                    categoryTags.forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');

                    const category = tag.textContent;
                    postCards.forEach(card => {
                        const postCategory = card.querySelector('.post-category').textContent;
                        if (category === 'All' || postCategory === category) {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
        }
    }

    /* ===== Auth Forms ===== */
    initAuthForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        document.querySelectorAll('.input-with-icon').forEach(wrapper => {
            const input = wrapper.querySelector('input');
            if (input) {
                input.addEventListener('focus', () => wrapper.classList.add('focused'));
                input.addEventListener('blur', () => wrapper.classList.remove('focused'));
            }
        });

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(registerForm);
            });
        }
    }

    async handleLogin(form) {
        const email = form.email.value.trim();
        const password = form.password.value;
        const alertBox = document.getElementById('loginAlert');

        this.clearErrors(form);

        let valid = true;

        if (!email) {
            this.showError('email', 'Email is required');
            valid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('email', 'Please enter a valid email address');
            valid = false;
        }

        if (!password) {
            this.showError('password', 'Password is required');
            valid = false;
        } else if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters');
            valid = false;
        }

        if (!valid) {
            if (alertBox) {
                alertBox.style.display = 'flex';
                alertBox.textContent = 'Please fix the errors below.';
            }
            return;
        }

        if (alertBox) alertBox.style.display = 'none';

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Signing in...';

        try {
            const { ok, status, data } = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (ok) {
                auth.setToken(data.token);
                auth.setUser(data.user);
                this.showApiAlert(alertBox, 'Login successful! Redirecting to dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                if (alertBox) {
                    alertBox.style.display = 'flex';
                    alertBox.textContent = data.error || 'Login failed. Please try again.';
                }
            }
        } catch (err) {
            if (alertBox) {
                alertBox.style.display = 'flex';
                alertBox.textContent = 'Network error. Please make sure the server is running.';
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    async handleRegister(form) {
        const firstName = form.firstName.value.trim();
        const lastName = form.lastName.value.trim();
        const email = form.email.value.trim();
        const username = form.username.value.trim();
        const password = form.password.value;
        const alertBox = document.getElementById('registerAlert');

        this.clearErrors(form);

        let valid = true;

        if (!firstName) {
            this.showError('firstName', 'First name is required');
            valid = false;
        }

        if (!lastName) {
            this.showError('lastName', 'Last name is required');
            valid = false;
        }

        if (!email) {
            this.showError('registerEmail', 'Email is required');
            valid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('registerEmail', 'Please enter a valid email address');
            valid = false;
        }

        if (!username) {
            this.showError('username', 'Username is required');
            valid = false;
        } else if (username.length < 3) {
            this.showError('username', 'Username must be at least 3 characters');
            valid = false;
        }

        if (!password) {
            this.showError('registerPassword', 'Password is required');
            valid = false;
        } else if (password.length < 8) {
            this.showError('registerPassword', 'Password must be at least 8 characters');
            valid = false;
        }

        const terms = form.terms.checked;
        if (!terms) {
            if (alertBox) {
                alertBox.style.display = 'flex';
                alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                alertBox.textContent = 'Please agree to the Terms of Service and Privacy Policy.';
            }
            valid = false;
        }

        if (!valid) return;

        if (alertBox) alertBox.style.display = 'none';

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Creating Account...';

        try {
            const { ok, status, data } = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ firstName, lastName, email, username, password })
            });

            if (ok) {
                this.showApiAlert(alertBox, 'Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                if (alertBox) {
                    alertBox.style.display = 'flex';
                    alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    alertBox.textContent = data.error || 'Registration failed. Please try again.';
                }
            }
        } catch (err) {
            if (alertBox) {
                alertBox.style.display = 'flex';
                alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                alertBox.textContent = 'Network error. Please make sure the server is running.';
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    showApiAlert(alertBox, message, type = 'error') {
        if (!alertBox) return;
        alertBox.className = type === 'success' 
            ? 'alert alert-success' 
            : 'alert alert-error';
        alertBox.textContent = message;
        alertBox.style.display = 'flex';
        if (type === 'success') {
            alertBox.style.backgroundColor = 'rgba(34, 197, 194, 0.1)';
            alertBox.style.borderColor = 'rgba(34, 197, 196, 0.5)';
        } else {
            alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            alertBox.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        }
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    }

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;

        input.style.borderColor = '#ef4444';

        const existing = input.parentNode.querySelector('.error-message');
        if (existing) existing.remove();
        input.parentNode.appendChild(errorDiv);
    }

    clearErrors(form) {
        const errors = form.querySelectorAll('.error-message');
        errors.forEach(e => e.remove());

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });

        const alertBox = document.querySelector('.alert');
        if (alertBox) {
            alertBox.style.display = 'none';
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /* ===== Dashboard ===== */
    initDashboard() {
        const tabs = document.querySelectorAll('.dashboard-tab');
        const tableBody = document.getElementById('blogTableBody');

        if (tabs.length && tableBody) {
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    const filter = tab.dataset.tab;
                    const rows = tableBody.querySelectorAll('tr');

                    rows.forEach(row => {
                        const status = row.dataset.status;
                        if (filter === 'all' || status === filter) {
                            row.style.display = '';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                });
            });

            if (auth.isAuthenticated()) {
                this.loadDashboardBlogs(tableBody);
            }

            tableBody.addEventListener('click', (e) => {
                const btn = e.target.closest('.action-btn');
                if (!btn) return;

                const row = btn.closest('tr');
                const title = row.querySelector('.post-title-col').textContent;
                const blogId = row.dataset.blogId;
                const action = btn.classList.contains('edit') ? 'edit' : 'delete';

                if (action === 'delete') {
                    if (confirm('Are you sure you want to delete "' + title + '"?')) {
                        apiFetch('/blogs/' + blogId, { method: 'DELETE' })
                            .then(({ ok, data }) => {
                                if (ok) {
                                    row.remove();
                                    this.showDashboardNotification('"' + title + '" has been deleted.');
                                } else {
                                    this.showDashboardNotification(data.error || 'Failed to delete blog.', 'error');
                                }
                            })
                            .catch(() => {
                                this.showDashboardNotification('Network error. Please try again.', 'error');
                            });
                    }
                } else {
                    window.location.href = 'create-blog.html?edit=' + blogId;
                }
            });
        }
    }

    async loadDashboardBlogs(tableBody) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading blogs...</td></tr>';

        const { ok, status, data } = await apiFetch('/blogs/user');

        if (tableBody) tableBody.innerHTML = '';

        if (status === 401) {
            auth.logout();
            window.location.href = 'login.html';
            return;
        }

        if (!ok) {
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load blogs. <a href="javascript:location.reload()">Retry</a></td></tr>';
            }
            return;
        }

        const blogs = data || [];

        const totalPostsEl = document.querySelector('.stat-number');
        if (totalPostsEl && totalPostsEl.textContent === '24' || (totalPostsEl && !totalPostsEl.dataset.set)) {
            totalPostsEl.textContent = blogs.length;
            totalPostsEl.dataset.set = 'true';
        }

        if (tableBody && blogs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No blog posts yet. Click "New Blog Post" to get started!</td></tr>';
            return;
        }

        blogs.forEach(blog => {
            const row = this.createBlogRow(blog);
            tableBody.appendChild(row);
        });
    }

    createBlogRow(blog) {
        const row = document.createElement('tr');
        row.dataset.status = blog.status;
        row.dataset.blogId = blog.id;

        const statusText = blog.status.charAt(0).toUpperCase() + blog.status.slice(1);
        const statusClass = 'status-' + blog.status;
        const date = formatDate(blog.createdAt);
        const views = blog.views && blog.views > 0 ? blog.views.toLocaleString() : '-';

        row.innerHTML =
            '<td class="post-title-col">' + blog.title + '</td>' +
            '<td>' + blog.category + '</td>' +
            '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
            '<td>' + views + '</td>' +
            '<td>' + date + '</td>' +
            '<td>' +
            '  <div class="action-btns">' +
            '    <button class="action-btn edit">Edit</button>' +
            '    <button class="action-btn delete">Delete</button>' +
            '  </div>' +
            '</td>';

        return row;
    }

    showDashboardNotification(message, type = 'success') {
        const dashboard = document.querySelector('.dashboard');
        if (!dashboard) return;

        const notification = document.createElement('div');
        notification.className = 'alert alert-' + type;
        notification.textContent = message;
        notification.style.marginBottom = '1rem';
        notification.style.display = 'flex';
        if (type === 'error') {
            notification.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            notification.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        }

        dashboard.insertBefore(notification, dashboard.firstChild);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /* ===== Blog Editor ===== */
    initBlogEditor() {
        const form = document.getElementById('createBlogForm');
        const titleInput = document.getElementById('postTitle');
        const contentTextarea = document.getElementById('postContent');
        const previewSection = document.getElementById('previewSection');
        const previewContent = document.getElementById('previewContent');
        const previewToggle = document.getElementById('previewToggle');
        const saveDraftBtn = document.getElementById('saveDraft');
        const publishBtn = document.getElementById('publishPost');

        if (titleInput && contentTextarea && previewContent) {
            const updatePreview = () => {
                const title = titleInput.value || 'Your Title Here';
                const content = contentTextarea.value;

                let formattedContent = '';
                if (content) {
                    formattedContent = content
                        .replace(/^###\s(.+)$/gm, '<h3>$1</h3>')
                        .replace(/^##\s(.+)$/gm, '<h2>$1</h2>')
                        .replace(/^#\s(.+)$/gm, '<h1>$1</h1>')
                        .replace(/\*\*(.+)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+)\*/g, '<em>$1</em>')
                        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                        .replace(/`(.+?)`/g, '<code>$1</code>')
                        .split('\n').filter(line => line.trim() !== '').join('<br><br>');
                } else {
                    formattedContent = '<p>Your blog post preview will appear here as you type.</p>';
                }

                previewContent.innerHTML = '<h2>' + title + '</h2>' + formattedContent;
                previewContent.classList.remove('empty');
            };

            titleInput.addEventListener('input', updatePreview);
            contentTextarea.addEventListener('input', updatePreview);

            if (previewToggle && previewSection) {
                let isPreviewVisible = true;
                const togglePreview = (visible) => {
                    if (visible) {
                        previewSection.classList.remove('hidden');
                        previewToggle.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4.5C7 4.5 2.73 7.46 1 12c1.74 4.54 6.03 7.5 11 7.5s9.27-2.96 11-7.5c-1.74-4.54-6.03-7.5-11-7.5zm0 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><circle cx="12" cy="12" r="2"/></svg> Hide Preview';
                    } else {
                        previewSection.classList.add('hidden');
                        previewToggle.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4.5C7 4.5 2.73 7.46 1 12c1.74 4.54 6.03 7.5 11 7.5s9.27-2.96 11-7.5c-1.74-4.54-6.03-7.5-11-7.5zm0 13c-2.24 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><circle cx="12" cy="12" r="2"/></svg> Show Preview';
                    }
                    isPreviewVisible = visible;
                };

                previewToggle.addEventListener('click', () => {
                    togglePreview(!isPreviewVisible);
                });
            }
        }

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const title = titleInput ? titleInput.value.trim() : '';
                if (!title) {
                    this.showEditorNotification('Please enter a title for your blog post.', 'error');
                    return;
                }
                this.saveBlog('draft');
            });
        }

        if (form && publishBtn) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = form.title.value.trim();
                const category = form.category.value;
                const content = form.content.value.trim();

                if (!title || !category || !content) {
                    this.showEditorNotification('Please fill in all required fields.', 'error');
                    return;
                }

                this.saveBlog('published');
            });
        }

        const urlParams = new URLSearchParams(window.location.search);
        const blogId = urlParams.get('edit');
        if (blogId) {
            this.loadBlogForEdit(blogId);
        }
    }

    async loadBlogForEdit(blogId) {
        const { ok, data } = await apiFetch('/blogs/' + blogId);

        if (!ok) {
            this.showEditorNotification('Failed to load blog for editing.', 'error');
            return;
        }

        const blog = data;
        this.editingBlogId = blogId;

        if (document.getElementById('postTitle')) document.getElementById('postTitle').value = blog.title || '';
        if (document.getElementById('postCategory')) document.getElementById('postCategory').value = blog.category || '';
        if (document.getElementById('postTags')) document.getElementById('postTags').value = blog.tags ? blog.tags.join(', ') : '';
        if (document.getElementById('postThumbnail')) document.getElementById('postThumbnail').value = blog.thumbnail || '';
        if (document.getElementById('postContent')) document.getElementById('postContent').value = blog.content || '';
        if (document.getElementById('postExcerpt')) document.getElementById('postExcerpt').value = blog.excerpt || '';
    }

    async saveBlog(status) {
        const form = document.getElementById('createBlogForm');
        if (!form) return;

        const blogData = {
            title: form.title.value.trim(),
            category: form.category.value,
            tags: form.tags.value.trim(),
            thumbnail: form.thumbnail.value.trim(),
            content: form.content.value.trim(),
            excerpt: form.excerpt.value.trim(),
            status: status
        };

        const isEdit = this.editingBlogId;
        const endpoint = isEdit ? '/blogs/' + this.editingBlogId : '/blogs';
        const method = isEdit ? 'PUT' : 'POST';

        this.showEditorNotification('Saving...');

        try {
            const { ok, status: statusCode, data } = await apiFetch(endpoint, {
                method: method,
                body: JSON.stringify(blogData)
            });

            if (ok) {
                const msg = isEdit
                    ? 'Blog post updated successfully!'
                    : (status === 'draft' ? 'Draft saved successfully!' : 'Blog post published successfully!');
                this.showEditorNotification(msg, 'success');
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
            } else if (statusCode === 401) {
                this.showEditorNotification('Your session has expired. Redirecting to login...', 'error');
                auth.logout();
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                this.showEditorNotification(data.error || 'Failed to save blog. Please try again.', 'error');
            }
        } catch (err) {
            this.showEditorNotification('Network error. Please make sure the server is running.', 'error');
        }
    }

    showEditorNotification(message, type = 'success') {
        if (this.lastEditorNotification) {
            this.lastEditorNotification.remove();
            this.lastEditorNotification = null;
        }

        const editor = document.querySelector('.create-blog');
        if (!editor) return;

        const notification = document.createElement('div');
        notification.className = 'alert alert-' + type;
        notification.textContent = message;
        notification.style.marginBottom = '1rem';
        notification.style.display = 'flex';
        if (type === 'error') {
            notification.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            notification.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        }

        editor.insertBefore(notification, editor.firstChild);
        this.lastEditorNotification = notification;

        setTimeout(() => {
            if (this.lastEditorNotification === notification) {
                notification.remove();
                this.lastEditorNotification = null;
            }
        }, 3000);
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    /* ===== Image Upload ===== */
    initImageUpload() {
        const self = this;
        const uploadBtn = document.getElementById('uploadImageBtn');
        const fileInput = document.getElementById('imageUpload');
        const thumbnailInput = document.getElementById('postThumbnail');
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImg = document.getElementById('imagePreview');

        if (!uploadBtn || !fileInput || !thumbnailInput) return;

        uploadBtn.addEventListener('click', () => {
            if (!auth.isAuthenticated()) {
                self.showEditorNotification('Please log in to upload images.', 'error');
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                return;
            }
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                self.showEditorNotification('Please select a valid image file.', 'error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                self.showEditorNotification('Image must be smaller than 5MB.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                const base64 = event.target.result.split(',')[1];

                uploadBtn.disabled = true;
                uploadBtn.innerHTML = 'Uploading...';

                apiFetch('/blogs/upload-image', {
                    method: 'POST',
                    body: JSON.stringify({
                        imageData: base64,
                        filename: file.name,
                        contentType: file.type
                    })
                })
                    .then(function (result) {
                        if (result.ok) {
                            thumbnailInput.value = result.data.url;
                            if (previewContainer && previewImg) {
                                previewImg.src = result.data.url;
                                previewContainer.style.display = 'block';
                            }
                        } else {
                            self.showEditorNotification(
                                result.data.error || 'Upload failed. Please try again.', 'error');
                        }
                    })
                    .catch(function () {
                        self.showEditorNotification(
                            'Network error. Please make sure the server is running.', 'error');
                    })
                    .finally(function () {
                        uploadBtn.disabled = false;
                        uploadBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg> Upload';
                    });
            };
            reader.readAsDataURL(file);
        });
    }

    /* ===== Index Page Blog Loading ===== */
    async loadIndexPosts() {
        const postGrid = document.getElementById('postGrid');
        if (!postGrid) return;

        try {
            const { ok, data } = await apiFetch('/blogs');

            if (!ok || !data || data.length === 0) {
                return;
            }

            if (postGrid.children.length > 0 && postGrid.querySelector('.post-card')) {
                postGrid.innerHTML = '';
            }

            data.forEach(blog => {
                const card = this.createBlogCard(blog);
                postGrid.appendChild(card);
            });
        } catch (err) {
            return;
        }
    }

    createBlogCard(blog) {
        const article = document.createElement('article');
        article.className = 'post-card';

        const imgSrc = blog.thumbnail || 'assets/images/Tech Post.JPG';
        const authorName = blog.authorName || 'Anonymous';
        const date = formatDate(blog.createdAt);
        const category = blog.category || 'General';
        const excerpt = blog.excerpt || 'Learn more about this topic...';

        article.innerHTML =
            '<img src="' + imgSrc + '" alt="' + blog.title + '" loading="lazy">' +
            '<div class="post-content">' +
            '  <div class="post-meta">' +
            '    <span class="author">By ' + authorName + '</span>' +
            '    <span class="date">' + date + '</span>' +
            '  </div>' +
            '  <h3 class="post-title">' + blog.title + '</h3>' +
            '  <p class="post-excerpt">' + excerpt + '</p>' +
            '  <div class="post-footer">' +
            '    <span class="post-category">' + category + '</span>' +
            '    <a href="blog.html?id=' + blog.id + '" class="post-readmore">' +
            '      Read More' +
            '      <svg viewBox="0 0 24 24" width="14" height="14">' +
            '        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>' +
            '      </svg>' +
            '    </a>' +
            '  </div>' +
            '</div>';

        return article;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BlogCodomax();
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const navLinks = document.getElementById('navLinks');
        const navToggle = document.getElementById('navToggle');
        if (navLinks && navToggle) {
            navLinks.classList.remove('mobile-open');
            navToggle.classList.remove('open');
            document.body.classList.remove('nav-open');
        }
    }
});
