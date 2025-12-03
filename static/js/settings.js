// Enhanced Settings Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeSectionNavigation();
    initializeProfilePicture();
    initializeThemeSelector();
    initializeCharacterCounters();
    initializeDeleteAccountModal();
    initializeFormAutoSave();
});

// Section Navigation
function initializeSectionNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            const sectionId = item.dataset.section;
            const targetSection = document.getElementById(sectionId);
            
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Smooth scroll to top of settings content
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Profile Picture Management
function initializeProfilePicture() {
    const profileInput = document.getElementById('profilePictureInput');
    const profileWrapper = document.querySelector('.profile-picture-wrapper');
    const removeBtn = document.querySelector('.remove-profile-picture-btn');

    if (!profileInput || !profileWrapper) return;

    // Click to upload
    profileWrapper.addEventListener('click', (e) => {
        // Don't trigger if clicking the remove button
        if (!e.target.closest('.remove-profile-picture-btn')) {
            profileInput.click();
        }
    });

    // File selection
    profileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                profileInput.value = '';
                return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                profileInput.value = '';
                return;
            }
            
            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                updateProfilePicturePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove profile picture
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to remove your profile picture?')) {
                removeProfilePicture();
            }
        });
    }
}

function updateProfilePicturePreview(imageSrc) {
    const placeholder = document.querySelector('.profile-picture-placeholder');
    const existingImg = document.querySelector('.profile-picture');
    
    if (existingImg) {
        existingImg.src = imageSrc;
    } else if (placeholder) {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = 'Profile';
        img.className = 'profile-picture';
        placeholder.replaceWith(img);
    }
    
    // Show remove button if it exists
    const removeBtn = document.querySelector('.remove-profile-picture-btn');
    if (removeBtn) {
        removeBtn.style.display = 'inline-flex';
    }
}

function removeProfilePicture() {
    const existingImg = document.querySelector('.profile-picture');
    const profileInput = document.getElementById('profilePictureInput');
    
    if (existingImg) {
        const placeholder = document.createElement('div');
        placeholder.className = 'profile-picture-placeholder';
        placeholder.innerHTML = '<i class="bx bx-user"></i>';
        existingImg.replaceWith(placeholder);
    }
    
    // Clear file input
    if (profileInput) {
        profileInput.value = '';
    }
    
    // Add hidden input to signal removal to server
    const form = document.querySelector('.settings-form');
    if (form) {
        let removeInput = form.querySelector('input[name="remove_profile_picture"]');
        if (!removeInput) {
            removeInput = document.createElement('input');
            removeInput.type = 'hidden';
            removeInput.name = 'remove_profile_picture';
            removeInput.value = 'true';
            form.appendChild(removeInput);
        }
    }
    
    // Hide remove button
    const removeBtn = document.querySelector('.remove-profile-picture-btn');
    if (removeBtn) {
        removeBtn.style.display = 'none';
    }
}

// Theme Selection
function initializeThemeSelector() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Set current theme as selected
    themeOptions.forEach(option => {
        if (option.dataset.theme === currentTheme) {
            option.classList.add('selected');
        }
        
        option.addEventListener('click', function() {
            // Remove selected from all
            themeOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected to clicked option
            this.classList.add('selected');
            
            const selectedTheme = this.dataset.theme;
            
            // Apply theme
            if (selectedTheme === 'auto') {
                localStorage.removeItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', selectedTheme);
                localStorage.setItem('theme', selectedTheme);
            }
            
            // Update navbar theme toggle icon
            updateThemeToggleIcon(selectedTheme);
            
            // Show confirmation
            showToast('Theme updated successfully', 'success');
        });
    });
}

function updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                icon.className = prefersDark ? 'fa fa-sun' : 'fa fa-moon';
            } else {
                icon.className = theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
            }
        }
    }
}

// Character Counters for Textareas
function initializeCharacterCounters() {
    const textareas = document.querySelectorAll('.form-textarea');
    
    textareas.forEach(textarea => {
        const counter = textarea.nextElementSibling;
        
        if (counter && counter.classList.contains('character-count')) {
            // Update counter on input
            textarea.addEventListener('input', function() {
                updateCharacterCount(this, counter);
            });
            
            // Initial count
            updateCharacterCount(textarea, counter);
        }
    });
}

function updateCharacterCount(textarea, counter) {
    const maxLength = parseInt(textarea.getAttribute('maxlength') || '500');
    const currentLength = textarea.value.length;
    
    counter.textContent = `${currentLength} / ${maxLength}`;
    
    // Change color based on usage
    if (currentLength > maxLength * 0.9) {
        counter.style.color = 'var(--warning)';
    } else if (currentLength > maxLength * 0.7) {
        counter.style.color = 'var(--info)';
    } else {
        counter.style.color = 'var(--text-muted)';
    }
}

// Delete Account Modal
function initializeDeleteAccountModal() {
    const deleteModal = document.getElementById('deleteAccountModal');
    if (!deleteModal) return;

    const confirmInput = deleteModal.querySelector('#confirmUserId');
    const confirmBtn = deleteModal.querySelector('#confirmDeleteBtn');
    const deleteForm = deleteModal.querySelector('#deleteAccountForm');
    
    // Get the correct user ID from data attribute
    const userIdElement = document.querySelector('[data-userid]');
    const correctUserId = userIdElement ? userIdElement.dataset.userid : '';

    if (!confirmInput || !confirmBtn || !deleteForm) return;

    // Real-time validation
    confirmInput.addEventListener('input', function() {
        const inputValue = this.value.trim();
        
        if (inputValue === correctUserId) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
        } else {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.6';
        }
    });

    // Form submission
    confirmBtn.addEventListener('click', function() {
        if (!this.disabled) {
            if (confirm('⚠️ This will permanently delete your account and all data. This action CANNOT be undone!')) {
                deleteForm.submit();
            }
        }
    });
    
    // Allow Enter key to submit
    confirmInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !confirmBtn.disabled) {
            e.preventDefault();
            if (confirm('⚠️ This will permanently delete your account and all data. This action CANNOT be undone!')) {
                deleteForm.submit();
            }
        }
    });
    
    // Reset modal when closed
    deleteModal.addEventListener('hidden.bs.modal', function() {
        confirmInput.value = '';
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.6';
    });
}

// Auto-save indicator
function initializeFormAutoSave() {
    const forms = document.querySelectorAll('.settings-form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                // Add visual indicator that there are unsaved changes
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.classList.contains('has-changes')) {
                    submitBtn.classList.add('has-changes');
                    
                    // Add pulsing animation
                    submitBtn.style.animation = 'pulse 2s infinite';
                }
            });
        });
        
        // Remove indicator on form submit
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.remove('has-changes');
                submitBtn.style.animation = '';
            }
        });
    });
}

// Toast notification helper
function showToast(message, type = 'info') {
    const flashContainer = document.querySelector('.flash-container') || createFlashContainer();
    
    const toast = document.createElement('div');
    toast.className = `flash-message flash-${type}`;
    toast.innerHTML = `
        <div class="flash-icon">
            <i class="bx ${getIconForType(type)}"></i>
        </div>
        <span class="flash-text">${message}</span>
        <button class="flash-close" onclick="this.parentElement.remove()">
            <i class="bx bx-x"></i>
        </button>
    `;
    
    flashContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-container';
    document.body.appendChild(container);
    return container;
}

function getIconForType(type) {
    const icons = {
        success: 'bx-check-circle',
        danger: 'bx-error-circle',
        warning: 'bx-error',
        info: 'bx-info-circle'
    };
    return icons[type] || icons.info;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const activeSection = document.querySelector('.section.active');
        if (activeSection) {
            const form = activeSection.querySelector('.settings-form');
            if (form) {
                form.querySelector('button[type="submit"]')?.click();
            }
        }
    }
});

// Pulse animation for save button
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
        }
        50% {
            box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
        }
    }
`;
document.head.appendChild(style);
