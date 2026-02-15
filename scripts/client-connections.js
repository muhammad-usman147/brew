// Filter functionality
const filterBtns = document.querySelectorAll('.filter-btn');
const connectionCards = document.querySelectorAll('.connection-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        
        // Update active filter button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter connection cards
        connectionCards.forEach(card => {
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
        
        connectionCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const niche = card.querySelector('.niche').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || niche.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// View messages
function viewMessages(influencerId) {
    // Redirect to messages page with this influencer
    window.location.href = `client-messages.html?influencer=${influencerId}`;
}

// Create campaign for specific influencer
function createCampaignFor(influencerId) {
    showToast('Creating new campaign for this influencer...', 'info');
    // In real app, this would pre-fill campaign form with this influencer
    setTimeout(() => {
        showToast('Campaign form would open with influencer pre-selected', 'success');
    }, 1000);
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
