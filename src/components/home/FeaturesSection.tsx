import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {icon}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

// SVG icons as React components - redesigned to match the image
const LegalIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="45" stroke="white" strokeWidth="2" />
    <rect x="40" y="30" width="40" height="60" rx="2" stroke="white" strokeWidth="2" />
    <line x1="50" y1="45" x2="70" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="55" x2="70" y2="55" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="65" x2="70" y2="65" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="75" x2="60" y2="75" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const RegulatoryIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 30L95 50V85L60 105L25 85V50L60 30Z" stroke="white" strokeWidth="2" fill="none" />
    <line x1="60" y1="60" x2="60" y2="105" stroke="white" strokeWidth="2" />
    <line x1="60" y1="60" x2="95" y2="50" stroke="white" strokeWidth="2" />
    <line x1="60" y1="60" x2="25" y2="50" stroke="white" strokeWidth="2" />
    <circle cx="60" cy="40" r="5" stroke="white" strokeWidth="2" />
  </svg>
);

const LockIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="55" width="60" height="40" rx="3" stroke="white" strokeWidth="2" />
    <path d="M45 55V40C45 32.268 51.268 25 60 25C68.732 25 75 32.268 75 40V55" stroke="white" strokeWidth="2" />
    <circle cx="60" cy="75" r="8" stroke="white" strokeWidth="2" />
  </svg>
);

const RocketIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 20L40 40V80L60 100L80 80V40L60 20Z" stroke="white" strokeWidth="2" fill="none" />
    <path d="M50 60L60 70L70 60" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="60" y1="40" x2="60" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="60" cy="35" r="5" stroke="white" strokeWidth="2" />
  </svg>
);

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Legal Asset Segregation',
      description: 'Your users\' assets protected, not on our balance sheet',
      icon: <LegalIcon />
    },
    {
      title: 'Regulatory Clarity',
      description: 'Licensed NC trust company satisfies compliance requirements',
      icon: <RegulatoryIcon />
    },
    {
      title: 'No Minimums & No Lock-up Periods',
      description: 'Maintain operational flexibility',
      icon: <LockIcon />
    },
    {
      title: 'Ready-to-Use Infrastructure',
      description: 'Ship in weeks, not months.',
      icon: <RocketIcon />
    }
  ];

  return (
    <section className="features-section hexagon-pattern">
      <div className="features-container">
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
