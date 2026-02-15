// Tab Switching
const tabs = document.querySelectorAll('.tab');
const tabContents = {
    'all-jobs': document.getElementById('allJobsTab'),
    'applied': document.getElementById('appliedTab'),
    'saved': document.getElementById('savedTab')
};

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Hide all tab contents
        Object.values(tabContents).forEach(content => {
            if (content) content.classList.add('hidden');
        });
        
        // Show selected tab content
        if (tabContents[targetTab]) {
            tabContents[targetTab].classList.remove('hidden');
        }
    });
});

// Filter functionality
const filterBtns = document.querySelectorAll('.filter-btn');
const jobCards = document.querySelectorAll('.job-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        
        // Update active filter button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter job cards
        jobCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                const category = card.getAttribute('data-category');
                if (category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
});

// Search functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        jobCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.job-description').textContent.toLowerCase();
            const clientName = card.querySelector('.client-name').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm) || clientName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Save/Unsave job
const savedJobs = new Set();

function toggleSave(jobId) {
    const saveBtn = document.querySelector(`[data-job-id="${jobId}"] .save-btn`);
    
    if (savedJobs.has(jobId)) {
        savedJobs.delete(jobId);
        saveBtn.classList.remove('saved');
        showToast('Job removed from saved', 'info');
    } else {
        savedJobs.add(jobId);
        saveBtn.classList.add('saved');
        showToast('Job saved successfully!', 'success');
    }
    
    updateSavedTab();
}

function updateSavedTab() {
    const savedTab = document.getElementById('savedTab');
    const savedCount = savedJobs.size;
    
    // Update tab label
    const savedTabBtn = document.querySelector('[data-tab="saved"]');
    if (savedTabBtn) {
        savedTabBtn.textContent = `Saved (${savedCount})`;
    }
    
    // Update saved tab content
    if (savedCount === 0) {
        savedTab.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔖</div>
                <h3>Your saved jobs will appear here</h3>
                <p>Save interesting campaigns to review later</p>
            </div>
        `;
    } else {
        // In a real app, this would filter and display saved jobs
        savedTab.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔖</div>
                <h3>You have ${savedCount} saved job${savedCount > 1 ? 's' : ''}</h3>
                <p>Saved jobs would appear here in the full implementation</p>
            </div>
        `;
    }
}

// Proposal Modal
let currentJobId = null;

function openProposalModal(jobId) {
    currentJobId = jobId;
    const modal = document.getElementById('proposalModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProposalModal() {
    const modal = document.getElementById('proposalModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentJobId = null;
    
    // Reset form
    document.getElementById('proposalForm').reset();
}

// Close modal on outside click
document.getElementById('proposalModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'proposalModal') {
        closeProposalModal();
    }
});

// Handle proposal submission
const proposalForm = document.getElementById('proposalForm');
if (proposalForm) {
    proposalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const price = document.getElementById('proposalPrice').value;
        const deliveryTime = document.getElementById('deliveryTime').value;
        const proposalText = document.getElementById('proposalText').value;
        
        if (!price || !deliveryTime || !proposalText) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Simulate submission
        const submitBtn = proposalForm.querySelector('.btn-primary');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        setTimeout(() => {
            showToast('Proposal submitted successfully!', 'success');
            closeProposalModal();
            
            // Update applied count
            const appliedTab = document.querySelector('[data-tab="applied"]');
            if (appliedTab) {
                const currentCount = parseInt(appliedTab.textContent.match(/\d+/)?.[0] || '0');
                appliedTab.textContent = `Applied (${currentCount + 1})`;
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Proposal';
        }, 1500);
    });
}

// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast styles dynamically
const toastStyles = document.createElement('style');
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Show welcome message
    setTimeout(() => {
        showToast('Welcome back, Sarah! 👋', 'success');
    }, 500);
});
