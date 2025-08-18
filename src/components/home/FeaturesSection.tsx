import React from 'react';

// Import images directly
import legalIcon from '../../../public/images/icons/legal-asset-protection-icon.png';
import regulatoryIcon from '../../../public/images/icons/Regulatory-clarity-icon.png';
import noMinimumsIcon from '../../../public/images/icons/No-minimums-icon.png';
import readyToUseIcon from '../../../public/images/icons/ready-to-use-icon.png';

interface FeatureCardProps {
  title: string;
  description: string;
  iconSrc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, iconSrc }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <img src={iconSrc} alt={`${title} icon`} width="120" height="120" />
      </div>
      <h3 className="feature-title font-tagline">{title}</h3>
      <p className="feature-description font-body">{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  // Images are imported at the top of the file

  const features = [
    {
      title: 'Legal Asset Segregation',
      description: 'Your users\' assets protected, not on our balance sheet',
      iconSrc: legalIcon
    },
    {
      title: 'Regulatory Clarity',
      description: 'Licensed NC trust company satisfies compliance requirements',
      iconSrc: regulatoryIcon
    },
    {
      title: 'No Minimums & No Lock-up Periods',
      description: 'Maintain operational flexibility',
      iconSrc: noMinimumsIcon
    },
    {
      title: 'Ready-to-Use Infrastructure',
      description: 'Ship in weeks, not months.',
      iconSrc: readyToUseIcon
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
