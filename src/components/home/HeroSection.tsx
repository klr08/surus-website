import React from 'react';

interface HeroSectionProps {
  onCalculateClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onCalculateClick }) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-tagline">YOU BUILD THE DEFI.</div>
        <h1 className="hero-heading">We'll Handle the TradFi.</h1>
        <p className="hero-subtitle">Pricing that scales with you.</p>
        
        <div className="hero-cta">
          <button className="cta-button" onClick={onCalculateClick}>
            CALCULATE YOUR SAVINGS
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
