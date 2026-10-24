/* Blog Codomax - Main JavaScript */

class BlogCodomax {
    constructor() {
        this.initNavbar();
        this.initAuthForms();
        this.initDashboard();
        this.initBlogEditor();
        this.initSearch();
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

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                    navToggle.classList.remove('open');
                    navLinks.classList.remove('mobile-open');
                    document.body.classList.remove('nav-open');
                }
            });

            // Close menu when clicking a link
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

    /* ===== Search ===== */
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        const postGrid = document.getElementById('postGrid');
        const postCards = postGrid ? postGrid.querySelectorAll('.post-card') : [];

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

            // Category filter
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

        // Handle icon focus effects
        document.querySelectorAll('.input-with-icon').forEach(wrapper => {
            const input = wrapper.querySelector('input');
            input.addEventListener('focus', () => wrapper.classList.add('focused'));
            input.addEventListener('blur', () => wrapper.classList.remove('focused'));
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

    handleLogin(form) {
        const email = form.email.value.trim();
        const password = form.password.value;
        const alertBox = document.getElementById('loginAlert');

        // Clear previous errors
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
            alertBox.style.display = 'flex';
            alertBox.textContent = 'Please fix the errors below.';
            return;
        }

        // Simulate login success
        alertBox.style.display = 'none';

        // Show success message and redirect
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success';
        successMsg.textContent = 'Login successful! Redirecting to dashboard...';
        alertBox.parentNode.insertBefore(successMsg, alertBox);

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    handleRegister(form) {
        const firstName = form.firstName.value.trim();
        const lastName = form.lastName.value.trim();
        const email = form.email.value.trim();
        const username = form.username.value.trim();
        const password = form.password.value;
        const alertBox = document.getElementById('registerAlert');

        // Clear previous errors
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
            alertBox.style.display = 'flex';
            alertBox.textContent = 'Please agree to the Terms of Service and Privacy Policy.';
            valid = false;
        }

        if (!valid) return;

        // Simulate registration success
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success';
        successMsg.textContent = 'Registration successful! Redirecting to login...';
        alertBox.parentNode.insertBefore(successMsg, alertBox);

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;

        input.style.borderColor = '#ef4444';
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
        }

        // Handle action buttons (edit/delete)
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const title = row.querySelector('.post-title-col').textContent;
                const action = e.target.classList.contains('edit') ? 'edit' : 'delete';

                if (action === 'delete') {
                    if (confirm(`Are you sure you want to delete "${title}"?`)) {
                        row.remove();
                        this.showDashboardNotification(`"${title}" has been deleted.`);
                    }
                } else {
                    window.location.href = `create-blog.html?edit=${encodeURIComponent(title)}`;
                }
            });
        });
    }

    showDashboardNotification(message) {
        const dashboard = document.querySelector('.dashboard');
        if (!dashboard) return;

        const notification = document.createElement('div');
        notification.className = 'alert alert-success';
        notification.textContent = message;
        notification.style.marginBottom = '1rem';

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

                    previewContent.innerHTML = `<h2>${title}</h2>${formattedContent}`;
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
                            previewToggle.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4.5C7 4.5 2.73 7.46 1 12c1.74 4.54 6.03 7.5 11 7.5s9.27-2.96 11-7.5c-1.74-4.54-6.03-7.5-11-7.5zm0 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><circle cx="12" cy="12" r="2"/></svg> Show Preview';
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
                    alert('Please enter a title for your blog post.');
                    return;
                }
                this.showEditorNotification('Draft saved successfully!', 'success');
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
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

                this.showEditorNotification('Blog post published successfully!', 'success');
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
            });
        }
    }

    showEditorNotification(message, type = 'success') {
        const editor = document.querySelector('.create-blog');
        if (!editor) return;

        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.textContent = message;
        notification.style.marginBottom = '1rem';
        notification.style.display = 'flex';

        editor.insertBefore(notification, editor.firstChild);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BlogCodomax();
});

// Auto-close mobile menu on page resize if window becomes wider
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