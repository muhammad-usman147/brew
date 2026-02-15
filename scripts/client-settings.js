// Section Navigation
const navItems = document.querySelectorAll('.settings-nav-item');
const sections = document.querySelectorAll('.settings-section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = item.getAttribute('data-section');
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show target section
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Profile Photo Preview
function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profilePreview').src = e.target.result;
            showToast('Profile photo updated!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    if (confirm('Remove your profile photo?')) {
        document.getElementById('profilePreview').src = 'https://i.pravatar.cc/150?img=12';
        showToast('Profile photo removed', 'info');
    }
}

// Form Submissions
document.getElementById('personalInfoForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Personal information updated successfully!', 'success');
});

document.getElementById('companyInfoForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Company settings updated successfully!', 'success');
});

document.getElementById('passwordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    showToast('Password updated successfully!', 'success');
    document.getElementById('passwordForm').reset();
});

// Reset Form
function resetForm(formId) {
    document.getElementById(formId).reset();
    showToast('Changes discarded', 'info');
}

// Billing Actions
function showPricingModal() {
    showToast('Opening pricing plans...', 'info');
    // In real app, this would show a modal with pricing options
    setTimeout(() => {
        window.location.href = 'index.html#pricing';
    }, 1000);
}

function updatePaymentMethod() {
    showToast('Opening payment method update...', 'info');
    // In real app, this would open Stripe or payment modal
}

function downloadInvoice(invoiceId) {
    showToast(`Downloading invoice ${invoiceId}...`, 'info');
    // In real app, this would download the actual invoice PDF
}

// Account Actions
function logoutAllDevices() {
    if (confirm('Logout from all devices? You will need to sign in again on all your devices.')) {
        showToast('Logged out from all devices', 'success');
        setTimeout(() => {
            // In real app, this would call logout API
            window.location.href = 'index.html';
        }, 1500);
    }
}

function deleteAccount() {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation === 'DELETE') {
        showToast('Account deletion initiated. You will receive a confirmation email.', 'error');
        setTimeout(() => {
            // In real app, this would call delete account API
            window.location.href = 'index.html';
        }, 2000);
    } else if (confirmation !== null) {
        showToast('Deletion cancelled - confirmation did not match', 'info');
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast styles if not already added
if (!document.getElementById('toast-styles')) {
    const toastStyles = document.createElement('style');
    toastStyles.id = 'toast-styles';
    toastStyles.textContent = `
        .toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 3000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .toast-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
        }
        
        .toast-success .toast-icon {
            background: #10b981;
            color: white;
        }
        
        .toast-error .toast-icon {
            background: #ef4444;
            color: white;
        }
        
        .toast-info .toast-icon {
            background: #3b82f6;
            color: white;
        }
        
        .toast-message {
            font-weight: 600;
            color: var(--text-dark);
        }
        
        @media (max-width: 768px) {
            .toast {
                bottom: 1rem;
                right: 1rem;
                left: 1rem;
            }
        }
    `;
    document.head.appendChild(toastStyles);
}
