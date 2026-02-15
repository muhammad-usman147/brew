// Navigation scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.main-nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
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

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
});

// Form validation helper
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Add error styles dynamically
const style = document.createElement('style');
style.textContent = `
    input.error, textarea.error {
        border-color: #ef4444 !important;
    }
    
    .success-message {
        padding: 1rem;
        background: #10b981;
        color: white;
        border-radius: 12px;
        margin-top: 1rem;
        text-align: center;
        font-weight: 600;
        animation: fadeIn 0.3s ease;
    }
    
    .error-message {
        padding: 1rem;
        background: #ef4444;
        color: white;
        border-radius: 12px;
        margin-top: 1rem;
        text-align: center;
        font-weight: 600;
        animation: fadeIn 0.3s ease;
    }
`;
document.head.appendChild(style);
