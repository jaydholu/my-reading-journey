document.addEventListener('DOMContentLoaded', function () {
    initializeTheme();
    initializeMobileMenu();
    initializeFlashMessages();
    initializeScrollEffects();
    initializeBookSearch();
    initializeAnimations();
    initializeUploadModal();
    initializeDeleteAccountModal();
});


// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Initial theme
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
        }
    }
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}


// Mobile Menu
function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function (event) {
            event.stopPropagation();
            mobileNav.classList.toggle('show');
            mobileToggle.classList.toggle('active');
        });
    }
}


// Flash Messages
function initializeFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            dismissFlashMessage(message);
        }, 5000); // Auto-dismiss after 5 seconds
    });
}

function dismissFlashMessage(message) {
    // Add a fade-out animation
    message.style.opacity = '0';
    message.style.transform = 'translateX(20px)';
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 3000); // Remove after animation
}


// Scroll Effects for Navbar
function initializeScrollEffects() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (currentScrollTop > lastScrollTop && currentScrollTop > navbar.offsetHeight) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        }, { passive: true });
    }
}


// Book Search and Sorting
function initializeBookSearch() {
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.addEventListener('input', filterBooks);
    }
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortBooks);
    }
}

function filterBooks() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase().trim();
    const bookCards = document.querySelectorAll('.book-card');
    const noResults = document.getElementById('noResults');
    let visibleCount = 0;

    bookCards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const author = card.getAttribute('data-author') || '';
        const isMatch = title.includes(searchTerm) || author.includes(searchTerm);
        if (isMatch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function sortBooks() {
    const sortValue = document.getElementById('sortBy').value;
    if (!sortValue) return;

    const bookGrid = document.getElementById('bookGrid');
    if (!bookGrid) return;

    const bookCards = Array.from(bookGrid.querySelectorAll('.book-card'));
    const [field, direction] = sortValue.split('-');

    bookCards.sort((a, b) => {
        const valueA = a.getAttribute(`data-${field}`) || '';
        const valueB = b.getAttribute(`data-${field}`) || '';

        const comparison = valueA.localeCompare(valueB, undefined, { numeric: true });
        return direction === 'desc' ? -comparison : comparison;
    });

    bookCards.forEach(card => bookGrid.appendChild(card));
}


// Fade-in Animations on Scroll
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.book-card, .stat-card, .empty-state').forEach(el => {
        el.classList.add('fade-in-init');
        observer.observe(el);
    });
}


// Fixed Upload Modal - prevent double submission
function initializeUploadModal() {
    const uploadModal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    const uploadArea = uploadModal?.querySelector('.upload-area');
    const fileInput = uploadModal?.querySelector('.file-input');
    const uploadText = uploadModal?.querySelector('.upload-text');

    if (uploadModal && uploadForm && uploadSubmitBtn && uploadArea && fileInput && uploadText) {
        // Prevent double form submission
        let isSubmitting = false;

        // Upload area click handler
        uploadArea.addEventListener('click', (e) => {
            // Prevent triggering file input if clicked on the file input itself
            if (e.target !== fileInput) {
                fileInput.click();
            }
        });

        // File input change handler
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadText.textContent = e.target.files[0].name;
            } else {
                uploadText.textContent = 'Choose your JSON file';
            }
        });

        // Form submission handler with prevention of double submission
        uploadForm.addEventListener('submit', (e) => {
            if (isSubmitting) {
                e.preventDefault();
                return;
            }

            if (fileInput.files.length === 0) {
                e.preventDefault();
                alert("Please select a JSON file to upload.");
                return;
            }

            // Set submitting state
            isSubmitting = true;
            uploadSubmitBtn.disabled = true;
            uploadSubmitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Uploading...';
        });

        // Reset form state when modal is hidden
        uploadModal.addEventListener('hidden.bs.modal', () => {
            isSubmitting = false;
            uploadSubmitBtn.disabled = false;
            uploadSubmitBtn.innerHTML = 'Upload Books';
            uploadText.textContent = 'Choose your JSON file';
            fileInput.value = '';
        });
    }
}

// Global function to open upload modal (called from navbar)
function openUploadModal() {
    const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
    uploadModal.show();
}


function initializeDeleteAccountModal() {
    const deleteModal = document.getElementById('deleteAccountModal');
    if (!deleteModal) return;

    const confirmInput = deleteModal.querySelector('#confirmUserId');
    const confirmBtn = deleteModal.querySelector('#confirmDeleteBtn');
    const deleteForm = deleteModal.querySelector('#deleteAccountForm');
    
    // Get the correct user ID from the template - this will be rendered by Jinja
    const correctUserIdElement = document.querySelector('[data-userid]');
    const correctUserId = correctUserIdElement ? correctUserIdElement.dataset.userid : '';

    if (confirmInput && confirmBtn && deleteForm) {
        confirmInput.addEventListener('input', () => {
            // Enable the button only if the input matches the user's User ID
            if (confirmInput.value === correctUserId) {
                confirmBtn.disabled = false;
            } else {
                confirmBtn.disabled = true;
            }
        });

        confirmBtn.addEventListener('click', () => {
            // When the confirmation button is clicked, submit the form
            if (!confirmBtn.disabled) {
                deleteForm.submit();
            }
        });
    }
}


// Calculate current age to render on 'developer' page
document.addEventListener('DOMContentLoaded', function() {
    const birthDate = new Date('2005-02-09');
    const currentAge = new Date().getFullYear() - birthDate.getFullYear();
    const ageElement = document.querySelector('.age');
    if (ageElement) {
        ageElement.innerText = currentAge;
    }
});


// Additional utility functions
// Handle dropdown menus
document.addEventListener('click', function(e) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        if (!dropdown.parentElement.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
});

// Handle mobile menu close on outside click
document.addEventListener('click', function(e) {
    const mobileNav = document.getElementById('mobile-nav');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    
    if (mobileNav && mobileToggle && 
        !mobileNav.contains(e.target) && 
        !mobileToggle.contains(e.target)) {
        mobileNav.classList.remove('show');
        mobileToggle.classList.remove('active');
    }
});

// Handle escape key for modals and mobile menu
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close mobile menu
        const mobileNav = document.getElementById('mobile-nav');
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileNav && mobileNav.classList.contains('show')) {
            mobileNav.classList.remove('show');
            if (mobileToggle) {
                mobileToggle.classList.remove('active');
            }
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize tooltips if Bootstrap tooltips are available
if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Handle image loading errors
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = '/static/img/book.png'; // Fallback image
        this.alt = 'Image not available';
    });
});

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Service worker registration for PWA functionality (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment if you have a service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Handle online/offline status
window.addEventListener('online', function() {
    const offlineMessage = document.querySelector('.offline-message');
    if (offlineMessage) {
        offlineMessage.remove();
    }
});

window.addEventListener('offline', function() {
    const existingMessage = document.querySelector('.offline-message');
    if (!existingMessage) {
        const offlineDiv = document.createElement('div');
        offlineDiv.className = 'flash-message flash-warning offline-message';
        offlineDiv.innerHTML = `
            <div class="flash-icon"><i class="bx bx-wifi-off"></i></div>
            <span class="flash-text">You're offline. Some features may not work.</span>
        `;
        
        const flashContainer = document.querySelector('.flash-container') || 
                             (() => {
                                 const container = document.createElement('div');
                                 container.className = 'flash-container';
                                 document.body.appendChild(container);
                                 return container;
                             })();
        
        flashContainer.appendChild(offlineDiv);
    }
});

// Debug helper for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugApp = {
        theme: () => console.log('Current theme:', document.documentElement.getAttribute('data-theme')),
        storage: () => console.log('LocalStorage:', localStorage),
        forms: () => console.log('Forms:', document.querySelectorAll('form')),
        buttons: () => console.log('Buttons:', document.querySelectorAll('.btn'))
    };
}

// Dropdown menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (trigger && menu) {
            // Toggle dropdown on click
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                    if (otherMenu !== menu) {
                        otherMenu.classList.remove('show');
                    }
                });
                
                // Toggle current dropdown
                menu.classList.toggle('show');
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
    
    // Close dropdowns on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
    
    // Prevent dropdown menu clicks from closing the dropdown
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.addEventListener('click', function(e) {
            // Only close if clicking on a link, not the container
            if (e.target.closest('.dropdown-item')) {
                menu.classList.remove('show');
            }
        });
    });
});
