import React from 'react';

export default function About(): JSX.Element {
  return (
    <>
      <section className="page-header">
        <h1>About Surus</h1>
        <p>Your Bridge Between TradFi and DeFi</p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>Our mission is to accelerate and improve the onchain financial ecosystem with digitally native trust services.</p>
        </div>

        <div className="about-section">
          <h2>What We Do</h2>
          <p>Surus powers onchain finance by providing builders with regulated infrastructure that bridges traditional and digital assets. We provide institutional-grade asset management, custody, and compliance platform for the future of finance, built on top of our licensed and regulated financial institution: Surus Trust Company.</p>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Build?</h2>
        <p>Let's talk about how Surus can support your business</p>
        <a href="/#contact" className="cta-button">Get in Touch</a>
      </section>
    </>
  );
}


