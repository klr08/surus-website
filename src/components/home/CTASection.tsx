import React from 'react';

const CTASection: React.FC = () => {
  return (
    <section className="cta-section organic-sketch-pattern">
      <div className="cta-container">
        <h2 className="cta-heading font-section-header">Schedule a Strategy Call</h2>
        <p className="cta-description font-body">
          Let's talk about how Surus can support your business
        </p>
        <a href="mailto:hello@surus.io" className="cta-button font-body">
          CONTACT US
        </a>
      </div>
    </section>
  );
};

export default CTASection;
