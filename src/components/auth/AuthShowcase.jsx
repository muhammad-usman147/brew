"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1400&auto=format&fit=crop",
    quote: "I booked two high-paying shoots in my first week—more than I'd made in the previous month. I'm genuinely blown away and now have too much work!",
    author: "Sienna Hart",
    role: "Photographer | Lisbon, Portugal",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1400&auto=format&fit=crop",
    quote: "Brew transformed our creator partnerships completely. We found authentic influencers who increased our campaign conversion rate by 3.5x.",
    author: "Marcus Vance",
    role: "Brand Director | New York, USA",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop",
    quote: "With secure escrow deposits and streamlined proposals, I can focus on creating content without worrying about contract disputes.",
    author: "Elena Rostova",
    role: "Lifestyle Creator | London, UK",
  },
];

export default function AuthShowcase({
  slides = DEFAULT_SLIDES,
  customImage,
  backHref = "/",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[currentIndex] || slides[0];
  const activeImage = customImage || currentSlide.image;

  return (
    <div className="auth-right-pane">
      <div className="auth-showcase-stage">
        {/* Floating Circular Back Button */}
        <Link href={backHref} className="auth-notch-back-btn" title="Back to Home" aria-label="Back to Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>

        {/* Showcase Image */}
        <img
          key={activeImage}
          src={activeImage}
          alt={currentSlide.author}
          className="auth-stage-img"
        />

        {/* Gradient Overlay */}
        <div className="auth-stage-gradient" />

        {/* Frosted Glass Testimonial Box */}
        <div className="auth-quote-card">
          <div className="auth-quote-text-group">
            <p className="auth-quote-body">
              {currentSlide.quote}
            </p>
            <h4 className="auth-quote-author">{currentSlide.author}</h4>
            <p className="auth-quote-subtext">{currentSlide.role}</p>
          </div>

          {/* Stacked Arrows (Top: →, Bottom: ←) */}
          <div className="auth-carousel-arrows">
            <button
              type="button"
              className="auth-arrow-circle-btn"
              onClick={nextSlide}
              aria-label="Next slide"
              title="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button
              type="button"
              className="auth-arrow-circle-btn"
              onClick={prevSlide}
              aria-label="Previous slide"
              title="Previous"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
