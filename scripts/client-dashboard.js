// Filter functionality for influencers
const filterBtns = document.querySelectorAll('.filter-btn');
const influencerCards = document.querySelectorAll('.influencer-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        
        // Update active filter button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter influencer cards
        influencerCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                const platform = card.getAttribute('data-platform');
                if (platform === filter) {
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
        
        influencerCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const niche = card.querySelector('.niche').textContent.toLowerCase();
            const bio = card.querySelector('.bio').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || niche.includes(searchTerm) || bio.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Campaign Modal
function openCampaignModal() {
    const modal = document.getElementById('campaignModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCampaignModal() {
    const modal = document.getElementById('campaignModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('campaignForm').reset();
}

// Close modal on outside click
document.getElementById('campaignModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'campaignModal') {
        closeCampaignModal();
    }
});

// Handle campaign creation
const campaignForm = document.getElementById('campaignForm');
if (campaignForm) {
    campaignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('campaignTitle').value;
        const category = document.getElementById('campaignCategory').value;
        const budget = document.getElementById('campaignBudget').value;
        const description = document.getElementById('campaignDescription').value;
        const status = document.querySelector('input[name="status"]:checked').value;
        
        if (!title || !category || !budget || !description) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Simulate submission
        const submitBtn = campaignForm.querySelector('.btn-primary');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Campaign...';
        
        setTimeout(() => {
            let message = '';
            if (status === 'live') {
                message = 'Campaign created and published successfully!';
            } else if (status === 'private') {
                message = 'Private campaign created. You can invite influencers now.';
            } else {
                message = 'Campaign saved as draft.';
            }
            
            showToast(message, 'success');
            closeCampaignModal();
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Campaign';
        }, 1500);
    });
}

// View influencer profile
function viewProfile(influencerId) {
    showToast(`Opening profile for influencer ${influencerId}...`, 'info');
    // In a real app, this would navigate to the profile page
    setTimeout(() => {
        showToast('Full profile view would open here', 'info');
    }, 1000);
}

// Send message to influencer
function sendMessage(influencerId) {
    showToast('Opening message composer...', 'info');
    // In a real app, this would open the messaging interface
    setTimeout(() => {
        showToast('Message interface would open here', 'info');
    }, 1000);
}

// Toast notification system (reusing from influencer dashboard)
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

// Add toast styles (if not already added)
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        showToast('Welcome back, Marcus! 👋', 'success');
    }, 500);
});
