import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import BrewLogo from '../components/BrewLogo'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'


const slides = [
  { bg: 'linear-gradient(135deg,#ff8c42,#ff974c)', icon: '📱', title: 'Instagram Stories', desc: 'Authentic engagement with Gen Z audiences' },
  { bg: 'linear-gradient(135deg,#f4770b,#ff8c42)', icon: '🎥', title: 'YouTube Reviews', desc: 'Long-form content that builds trust' },
  { bg: 'linear-gradient(135deg,#ff974c,#ffb87a)', icon: '🎵', title: 'TikTok Trends', desc: 'Viral moments that create buzz' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [navScrolled, setNavScrolled] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', city: '', question: '' })
  const intervalRef = useRef(null)

  // Auto-advance slider
  useEffect(() => {
    intervalRef.current = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 4000)
    return () => clearInterval(intervalRef.current)
  }, [])

  // Scroll effect
  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const goToSlide = i => {
    setCurrentSlide(i)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 4000)
  }

  const handleContact = e => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.question) {
      showToast('Please fill in all required fields', 'error'); return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactForm.email)) {
      showToast('Please enter a valid email address', 'error'); return
    }
    setTimeout(() => {
      showToast("Thank you! We'll get back to you within 24 hours.", 'success')
      setContactForm({ name: '', email: '', city: '', question: '' })
    }, 500)
  }

  return (
    <div>
      {/* Nav */}
      <nav className={`main-nav${navScrolled ? ' scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <BrewLogo /><span>Brew</span>
          </div>
          <div className="nav-links">
            <a href="#why-brew">Why Brew</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
            <Link to="/influencer/dashboard" className="nav-btn secondary">Influencer Login</Link>
            <Link to="/client/dashboard" className="nav-btn primary">Client Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="animate-in">
              <span className="headline-accent">Connect</span> with the right influencers for your brand
            </h1>
            <p className="hero-subtitle animate-in delay-1">
              Brew brings together brands and content creators in a seamless marketplace. Find authentic partnerships that drive real results.
            </p>
            <div className="hero-cta animate-in delay-2">
              <Link to="/client/dashboard" className="btn-large primary">Get Started</Link>
              <a href="#why-brew" className="btn-large secondary">Learn More</a>
            </div>
            <div className="hero-stats animate-in delay-3">
              <div className="stat"><span className="stat-number">15K+</span><span className="stat-label">Active Influencers</span></div>
              <div className="stat"><span className="stat-number">2.5K+</span><span className="stat-label">Brands</span></div>
              <div className="stat"><span className="stat-number">50K+</span><span className="stat-label">Successful Campaigns</span></div>
            </div>
          </div>
          <div className="hero-slider">
            <div className="slider-container"
              onMouseEnter={() => clearInterval(intervalRef.current)}
              onMouseLeave={() => { intervalRef.current = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 4000) }}
            >
              {slides.map((slide, i) => (
                <div key={i} className={`slide${i === currentSlide ? ' active' : ''}`}>
                  <div className="slide-image" style={{ background: slide.bg }}>
                    <div className="slide-overlay">
                      <div className="platform-icon">{slide.icon}</div>
                      <h3>{slide.title}</h3>
                      <p>{slide.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="slider-nav">
                {slides.map((_, i) => (
                  <button key={i} className={`slider-dot${i === currentSlide ? ' active' : ''}`} onClick={() => goToSlide(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Brew */}
      <section className="why-brew" id="why-brew">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Brew?</h2>
            <p className="section-subtitle">Transform the way you connect with influencers</p>
          </div>
          <div className="benefits-grid">
            {[
              { icon:'⚡', title:'Lightning Fast Matching', stat:'10x faster than traditional methods', desc:'Our AI-powered algorithm connects you with the perfect influencers in minutes, not weeks. Say goodbye to endless email chains and cold outreach.' },
              { icon:'🎯', title:'Precision Targeting', stat:'95% campaign success rate', desc:'Filter by niche, audience demographics, engagement rates, and more. Find influencers whose followers match your ideal customer profile.' },
              { icon:'💰', title:'Maximize Your ROI', stat:'3.5x average ROI increase', desc:'Access transparent pricing, detailed analytics, and verified performance metrics. Make data-driven decisions that boost your bottom line.' },
              { icon:'🔒', title:'Secure & Protected', stat:'100% payment protection', desc:'Built-in escrow system, verified profiles, and contract management. Focus on creativity while we handle the logistics and security.' },
              { icon:'📊', title:'Real-Time Analytics', stat:'Live performance tracking', desc:'Track campaign performance with detailed dashboards. Monitor reach, engagement, conversions, and ROI all in one place.' },
              { icon:'🤝', title:'Build Lasting Relationships', stat:'Long-term partnership tools', desc:'Create a network of trusted creators. Manage all your partnerships, conversations, and collaborations in one central hub.' },
            ].map((b, i) => (
              <div key={i} className="benefit-card glass">
                <span className="benefit-icon">{b.icon}</span>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
                <span className="benefit-stat">{b.stat}</span>
              </div>
            ))}
          </div>

          <div className="comparison-section">
            <h3 className="comparison-title">Brew vs. Manual Outreach</h3>
            <div className="comparison-grid">
              <div className="comparison-item manual">
                <h4>❌ Manual Process</h4>
                <ul>
                  <li>2-4 weeks to find influencers</li>
                  <li>Endless back-and-forth emails</li>
                  <li>No verified metrics</li>
                  <li>Payment disputes & delays</li>
                  <li>Scattered communication</li>
                  <li>No performance tracking</li>
                </ul>
              </div>
              <div className="comparison-item brew">
                <h4>✓ With Brew</h4>
                <ul>
                  <li>Find matches in 5 minutes</li>
                  <li>Streamlined proposal system</li>
                  <li>Verified performance data</li>
                  <li>Secure payment escrow</li>
                  <li>Centralized messaging</li>
                  <li>Real-time analytics dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Increase Your Earnings</h2>
            <p className="section-subtitle">Brew helps you connect faster and earn more</p>
          </div>
          <div className="steps-container">
            {[
              { n:'01', title:'Post Your Campaign', desc:'Create a detailed brief with your requirements, budget, and timeline. Our system instantly notifies relevant influencers.' },
              { n:'02', title:'Review Proposals', desc:'Receive proposals from verified creators. Compare portfolios, rates, and past performance metrics in one dashboard.' },
              { n:'03', title:'Collaborate & Create', desc:'Use our built-in messaging, file sharing, and milestone tracking. Keep everything organized in one place.' },
              { n:'04', title:'Track & Optimize', desc:'Monitor real-time results and ROI. Use insights to refine future campaigns and build your creator network.' },
            ].map((step, i) => (
              <div key={i} className="step">
                <span className="step-number">{step.n}</span>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="earning-highlight glass">
            <div className="earning-content">
              <span className="earning-icon">💵</span>
              <div className="earning-text">
                <h3>Average Brew user earns 45% more</h3>
                <p>By reducing time spent on admin work and increasing campaign velocity, our users close more deals and increase their monthly revenue.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Simple Pricing</h2>
            <p className="section-subtitle">Choose the plan that works for you</p>
          </div>
          <div className="pricing-grid">
            {[
              { name: 'Starter', price: 49, desc: 'Perfect for small businesses and startups testing influencer marketing', features: ['Up to 5 active campaigns', '20 influencer searches/month', 'Basic analytics dashboard', 'Messaging & proposals', 'Payment protection'], btn: 'secondary', btnText: 'Get Started' },
              { name: 'Professional', price: 149, desc: 'For growing brands running multiple campaigns simultaneously', features: ['Unlimited active campaigns', 'Unlimited influencer searches', 'Advanced analytics & reporting', 'Priority messaging', 'Contract templates'], btn: 'primary', btnText: 'Get Started', featured: true },
              { name: 'Enterprise', price: 499, desc: 'For agencies and large brands with complex needs', features: ['Everything in Professional', 'White-label options', 'API access', 'Custom integrations', 'Multi-user team accounts', 'Advanced reporting suite'], btn: 'secondary', btnText: 'Contact Sales' },
            ].map((plan, i) => (
              <div key={i} className={`pricing-card glass${plan.featured ? ' featured' : ''}`}>
                <div className="plan-badge">{plan.name}</div>
                <div className="plan-price">
                  <span className="currency">$</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/month</span>
                </div>
                <p className="plan-description">{plan.desc}</p>
                <ul className="plan-features">
                  {plan.features.map((f, j) => <li key={j}>✓ {f}</li>)}
                </ul>
                <Link to={plan.btnText === 'Contact Sales' ? '/#contact' : '/client/dashboard'} className={`plan-btn ${plan.btn}`}>{plan.btnText}</Link>
              </div>
            ))}
          </div>
          <div className="pricing-note">
            <p>💡 All plans include secure payment processing. Influencers join free and pay a small commission on completed deals.</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact" id="contact">
        <div className="section-container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2 className="section-title">Get in Touch</h2>
              <p className="section-subtitle">Have questions? We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
              <div className="contact-methods">
                {[
                  { icon:'📧', title:'Email', info:'hello@brewmarket.com' },
                  { icon:'💬', title:'Live Chat', info:'Available Mon-Fri, 9am-6pm EST' },
                  { icon:'📱', title:'Phone', info:'+1 (555) 123-4567' },
                ].map((m, i) => (
                  <div key={i} className="contact-method">
                    <span className="method-icon">{m.icon}</span>
                    <div className="method-info">
                      <h4>{m.title}</h4>
                      <p>{m.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="contact-form-container glass">
              <form onSubmit={handleContact}>
                <div className="form-group">
                  <label>Name *</label>
                  <input value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>City (Optional)</label>
                  <input value={contactForm.city} onChange={e => setContactForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Your Question *</label>
                  <textarea value={contactForm.question} onChange={e => setContactForm(f => ({ ...f, question: e.target.value }))} rows={6} required />
                </div>
                <button type="submit" className="btn-submit">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo"><BrewLogo /><span>Brew</span></div>
              <p className="footer-description">Connecting brands with authentic influencers for meaningful partnerships.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#why-brew">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><Link to="/influencer/dashboard">For Influencers</Link></li>
                <li><Link to="/client/dashboard">For Brands</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#contact">About Us</a></li>
                <li><a href="#contact">Careers</a></li>
                <li><a href="#contact">Blog</a></li>
                <li><a href="#contact">Press</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#contact">Help Center</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#contact">Privacy Policy</a></li>
                <li><a href="#contact">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Brew. All rights reserved.</p>
            <div className="social-links">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="Instagram">📷</a>
            </div>
          </div>
        </div>
      </footer>

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
