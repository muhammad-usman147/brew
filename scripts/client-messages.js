// Select conversation
function selectConversation(conversationId) {
    // Remove active class from all conversations
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected conversation
    const selected = document.querySelector(`[data-id="${conversationId}"]`);
    if (selected) {
        selected.classList.add('active');
        
        // Remove unread badge
        const badge = selected.querySelector('.unread-badge');
        if (badge) {
            badge.remove();
        }
    }
    
    // In real app, this would load the conversation messages
    showToast(`Loading conversation ${conversationId}...`, 'info');
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }
    
    // Create message element
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
            <span class="message-time">${time}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Show typing indicator
    setTimeout(() => {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, 500);
    
    // Hide typing indicator after 2 seconds
    setTimeout(() => {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }, 2500);
}

// Handle enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search conversations
const searchInput = document.getElementById('searchConversations');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const conversations = document.querySelectorAll('.conversation-item');
        
        conversations.forEach(conversation => {
            const name = conversation.querySelector('h4').textContent.toLowerCase();
            const lastMessage = conversation.querySelector('.last-message').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                conversation.style.display = 'flex';
            } else {
                conversation.style.display = 'none';
            }
        });
    });
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

// Auto-scroll to latest message on load
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
