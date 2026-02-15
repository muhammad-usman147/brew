# Brew - Influencer Marketplace Platform

A beautiful, modern influencer marketplace web application where brands and content creators connect, collaborate, and create successful campaigns.

## 🎨 Design Philosophy

Brew features a **glassy, warm aesthetic** with a distinctive design that avoids generic AI patterns:

- **Color Palette**: Warm oranges (#f4770b, #ff8c42, #ff974c) on a soft cream background (#f3ede5)
- **Typography**: Playfair Display (headings) paired with DM Sans (body) for an elegant, professional look
- **Glassmorphism**: Frosted glass effects with subtle shadows and blur
- **Smooth Animations**: Micro-interactions and transitions for a polished feel

## 📁 Project Structure

```
brew/
├── index.html                      # Landing page with hero, benefits, pricing, contact
├── influencer-login.html           # Influencer dashboard with job listings
├── client-login.html               # Client dashboard with influencer search
├── styles/
│   ├── main.css                    # Global styles, variables, common components
│   ├── landing.css                 # Landing page specific styles
│   ├── dashboard.css               # Dashboard layout and job/influencer cards
│   └── client.css                  # Client-specific styles
└── scripts/
    ├── main.js                     # Global JavaScript utilities
    ├── landing.js                  # Landing page interactivity (slider, forms)
    ├── influencer-dashboard.js     # Influencer features (proposals, saving jobs)
    └── client-dashboard.js         # Client features (campaign creation, search)
```

## 🚀 Features

### Landing Page
- **Hero Section** with auto-rotating slider showcasing different platforms
- **Why Brew Section** with 6 benefit cards and comparison table
- **How It Works** with step-by-step process
- **Pricing Plans** with 3 subscription tiers
- **Contact Form** with validation

### Influencer Dashboard
- **Job Listings** with filtering by category (Fashion, Tech, Food, Lifestyle)
- **Search** functionality across job titles, descriptions, and brands
- **Three Tabs**: All Jobs, Applied, Saved
- **Job Cards** showing:
  - Title, description, budget
  - Client info with verification badge
  - Total spend and campaign history
  - Proposal submission modal
- **Save Jobs** for later review
- **Submit Proposals** with rate, timeline, and cover letter

### Client Dashboard
- **Influencer Search** with platform filtering (Instagram, YouTube, TikTok, Twitter)
- **Influencer Cards** displaying:
  - Profile photo, name, niche
  - Platform statistics (followers, engagement)
  - Past campaign count and average rate
  - Bio and tags
- **Create Campaign** modal with:
  - Title, category, budget
  - Description and requirements
  - Location and follower minimums
  - Status (Live, Private, Draft)
- **Quick Stats** showing views, proposals, connections, active campaigns

## 🎯 Key Pages to Create (Additional)

Based on the navigation, you'll want to create these additional pages:

### Influencer Pages
- `influencer-connections.html` - Connected clients with history
- `influencer-portfolio.html` - Social media portfolios (Instagram, TikTok, YouTube, etc.)
- `influencer-messages.html` - Messaging interface
- `influencer-settings.html` - Profile settings, privacy controls

### Client Pages
- `client-campaigns.html` - Manage active/past campaigns
- `client-connections.html` - Connected influencers
- `client-messages.html` - Messaging interface
- `client-settings.html` - Company settings, personal info

## 💡 Implementation Notes

### CSS Architecture
- **CSS Variables** for consistent theming
- **Mobile-first** responsive design
- **Glass effect** utility class for reusable frosted glass cards
- **Smooth transitions** on all interactive elements

### JavaScript Patterns
- **Event delegation** for dynamic content
- **Modal management** with body scroll lock
- **Toast notifications** for user feedback
- **Form validation** with visual error states
- **Filter and search** with real-time updates

### Design Patterns Used
- **Card-based layouts** for scannable content
- **Status badges** for quick visual identification
- **Empty states** for tabs without content
- **Loading states** for async operations
- **Progressive disclosure** with modals

## 🎨 Color Reference

```css
--bg-main: #f3ede5           /* Main background */
--primary-orange: #f4770b     /* Primary CTA, headings */
--secondary-orange: #ff974c   /* Gradients, accents */
--text-orange: #ff8c42        /* Text links, highlights */
--text-dark: #111827          /* Body text */
--card-bg: #ffefe0            /* Card backgrounds */
--white: #ffffff              /* Pure white */
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## ✨ Interactive Features

1. **Auto-rotating Hero Slider** (4s intervals)
2. **Smooth scroll** for anchor navigation
3. **Filter buttons** with active states
4. **Real-time search** across cards
5. **Save/unsave** jobs with visual feedback
6. **Modal forms** with validation
7. **Toast notifications** for actions
8. **Hover animations** on cards and buttons

## 🔧 Customization Guide

### Changing Colors
Edit CSS variables in `styles/main.css`:
```css
:root {
    --primary-orange: #your-color;
    /* ... other variables */
}
```

### Adding New Job Categories
1. Add filter button in HTML
2. Set `data-filter` attribute
3. Match with `data-category` on job cards

### Modifying Forms
All forms use consistent styling from `main.css`. Add new fields using the `.form-group` class structure.

## 🚀 Getting Started

1. Open `index.html` in a modern browser
2. No build process required - pure HTML/CSS/JS
3. All assets are self-contained (no external dependencies except Google Fonts)

## 🌟 Best Practices Implemented

- ✅ Semantic HTML5
- ✅ Accessible form labels and ARIA attributes
- ✅ CSS custom properties for maintainability
- ✅ Mobile-responsive design
- ✅ Fast load times (no heavy frameworks)
- ✅ Smooth animations and transitions
- ✅ Clean, commented code
- ✅ Consistent naming conventions

## 📝 Future Enhancements

- Add authentication pages (login/signup)
- Implement real backend integration
- Add payment processing
- Create analytics dashboards
- Build messaging system
- Add file upload for portfolios
- Implement real-time notifications
- Add calendar/scheduling features

## 🎓 Learning Resources

This project demonstrates:
- Modern CSS techniques (Grid, Flexbox, Custom Properties)
- Glassmorphism design trend
- JavaScript DOM manipulation
- Event handling and delegation
- Form validation
- Modal patterns
- Toast notification systems
- Responsive design principles

---

**Made with ❤️ for the Brew Influencer Marketplace**
