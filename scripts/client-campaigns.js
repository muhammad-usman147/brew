// Tab Switching
const tabs = document.querySelectorAll('.tab');
const tabContents = {
    'active': document.getElementById('activeTab'),
    'draft': document.getElementById('draftTab'),
    'completed': document.getElementById('completedTab')
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

// Campaign Actions
function editCampaign(campaignId) {
    showToast(`Opening editor for campaign ${campaignId}...`, 'info');
    // In real app, this would open an edit modal or redirect to edit page
}

function duplicateCampaign(campaignId) {
    showToast('Campaign duplicated successfully!', 'success');
    // In real app, this would create a copy of the campaign
}

function deleteCampaign(campaignId) {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
        showToast('Campaign deleted successfully', 'success');
        // In real app, this would delete the campaign from database
    }
}

function markAsComplete(campaignId) {
    if (confirm('Mark this campaign as completed? You can still view results and analytics.')) {
        showToast('Campaign marked as complete!', 'success');
        // In real app, this would update campaign status
    }
}

function publishCampaign(campaignId) {
    if (confirm('Publish this campaign? It will become visible to all influencers.')) {
        showToast('Campaign published successfully!', 'success');
        // In real app, this would change status from draft to active
    }
}

function viewResults(campaignId) {
    showToast('Loading campaign results...', 'info');
    // In real app, this would show detailed results page
}

// Proposals Modal
function viewProposals(campaignId) {
    const modal = document.getElementById('proposalsModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProposalsModal() {
    const modal = document.getElementById('proposalsModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal on outside click
document.getElementById('proposalsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'proposalsModal') {
        closeProposalsModal();
    }
});

function acceptProposal(proposalId) {
    if (confirm('Accept this proposal and hire the influencer? You will be redirected to payment and contract setup.')) {
        showToast('Proposal accepted! Redirecting to contract setup...', 'success');
        // In real app, this would start the hiring process
        setTimeout(() => {
            closeProposalsModal();
        }, 1500);
    }
}

function declineProposal(proposalId) {
    if (confirm('Decline this proposal? The influencer will be notified.')) {
        showToast('Proposal declined', 'info');
        // In real app, this would decline and notify influencer
    }
}

// Create Campaign (reusing from client-login)
function openCampaignModal() {
    // This would open the campaign creation modal
    // Redirecting to main dashboard for now
    window.location.href = 'client-login.html';
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

// Initialize chart animations on page load
document.addEventListener('DOMContentLoaded', () => {
    const chartBars = document.querySelectorAll('.chart-bar');
    
    chartBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.animation = 'growUp 0.6s ease-out forwards';
        }, index * 100);
    });
    
    // Add chart animation keyframes
    const chartAnimation = document.createElement('style');
    chartAnimation.textContent = `
        @keyframes growUp {
            from {
                height: 0;
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(chartAnimation);
});
