import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  iconSrc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, iconSrc }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="feature-card">
      <div className="feature-icon">
        {!imgError ? (
          <img 
            src={iconSrc} 
            alt={`${title} icon`} 
            width="120" 
            height="120" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="feature-icon-fallback">
            {title.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="feature-title font-tagline">{title}</h3>
      <p className="feature-description font-body">{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Legal Asset Segregation',
      description: 'Your users\' assets protected, not on our balance sheet',
      iconSrc: '/images/icons/legal-asset-protection-icon.png'
    },
    {
      title: 'Regulatory Clarity',
      description: 'Licensed NC trust company satisfies compliance requirements',
      iconSrc: '/images/icons/Regulatory-clarity-icon.png'
    },
    {
      title: 'No Minimums & No Lock-up Periods',
      description: 'Maintain operational flexibility',
      iconSrc: '/images/icons/No-minimums-icon.png'
    },
    {
      title: 'Ready-to-Use Infrastructure',
      description: 'Ship in weeks, not months.',
      iconSrc: '/images/icons/ready-to-use-icon.png'
    }
  ];

  return (
    <section className="features-section" id="services">
      <div className="features-container">
        <h2 className="features-heading font-section-header">Our Services</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              iconSrc={feature.iconSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
