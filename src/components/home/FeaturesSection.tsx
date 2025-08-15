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

// SVG icons as React components
const LegalIcon = () => (
  <svg width="120" height="120" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 12H44C45.1046 12 46 12.8954 46 14V54C46 55.1046 45.1046 56 44 56H20C18.8954 56 18 55.1046 18 54V14C18 12.8954 18.8954 12 20 12Z" stroke="white" strokeWidth="2"/>
    <path d="M24 20H40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 28H40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 36H40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 44H32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="32" r="20" stroke="white" strokeWidth="2"/>
  </svg>
);

const RegulatoryIcon = () => (
  <svg width="120" height="120" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8L56 20V44L32 56L8 44V20L32 8Z" stroke="white" strokeWidth="2"/>
    <path d="M32 32L32 56" stroke="white" strokeWidth="2"/>
    <path d="M56 20L32 32" stroke="white" strokeWidth="2"/>
    <path d="M8 20L32 32" stroke="white" strokeWidth="2"/>
    <path d="M32 8V20" stroke="white" strokeWidth="2"/>
    <circle cx="32" cy="20" r="4" stroke="white" strokeWidth="2"/>
  </svg>
);

const LockIcon = () => (
  <svg width="120" height="120" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="28" width="32" height="24" rx="2" stroke="white" strokeWidth="2"/>
    <path d="M24 28V20C24 15.5817 27.5817 12 32 12C36.4183 12 40 15.5817 40 20V28" stroke="white" strokeWidth="2"/>
    <circle cx="32" cy="40" r="4" stroke="white" strokeWidth="2"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="120" height="120" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8C24 16 16 24 16 36C16 48 24 56 32 56C40 56 48 48 48 36C48 24 40 16 32 8Z" stroke="white" strokeWidth="2"/>
    <path d="M32 24V40" stroke="white" strokeWidth="2"/>
    <path d="M24 32L32 40L40 32" stroke="white" strokeWidth="2"/>
    <path d="M16 36C12 36 8 40 8 48" stroke="white" strokeWidth="2"/>
    <path d="M48 36C52 36 56 40 56 48" stroke="white" strokeWidth="2"/>
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
    <section className="features-section">
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
