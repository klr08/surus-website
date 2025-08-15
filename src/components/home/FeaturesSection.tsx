import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  const [imageError, setImageError] = React.useState(false);
  
  const handleImageError = () => {
    console.error(`Failed to load image: ${icon}`);
    setImageError(true);
  };
  
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {imageError ? (
          <div className="feature-icon-fallback">{title.charAt(0)}</div>
        ) : (
          <img 
            src={icon} 
            alt={title} 
            onError={handleImageError}
          />
        )}
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
      description: 'Your users\' assets protected, not on our balance sheet',
      icon: '/images/legal-asset-protection-icon.png'
    },
    {
      title: 'Regulatory Clarity',
      description: 'Licensed NC trust company satisfies compliance requirements',
      icon: '/images/Regulatory-clarity-icon.png'
    },
    {
      title: 'No Minimums & No Lock-up Periods',
      description: 'Maintain operational flexibility',
      icon: '/images/No-minimums-icon.png'
    },
    {
      title: 'Ready-to-Use Infrastructure',
      description: 'Ship in weeks, not months.',
      icon: '/images/ready-to-use-icon.png'
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
