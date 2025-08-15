import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <img src={icon} alt={title} />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Legal Asset Segregation',
      description: 'Your client assets are legally segregated from operational funds.',
      icon: '/images/icons/legal-icon.svg'
    },
    {
      title: 'Regulatory Clarity',
      description: 'Compliant with US and global financial regulations.',
      icon: '/images/icons/regulatory-icon.svg'
    },
    {
      title: 'No Minimums & No Lock-ups',
      description: 'Scale as you grow without commitments.',
      icon: '/images/icons/lock-icon.svg'
    },
    {
      title: 'Ready-to-Use Infrastructure',
      description: 'APIs for seamless integration.',
      icon: '/images/icons/rocket-icon.svg'
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
