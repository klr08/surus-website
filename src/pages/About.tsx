import React from 'react';

type TeamMember = {
  name: string;
  title: string;
  bio: string;
  linkedin?: string;
  twitter?: string;
};

const teamMembers: TeamMember[] = [
  {
    name: "Patrick Murck",
    title: "Founder & CEO",
    bio: "Co-founder and Principal at Plural VC. Previously, President & CLO at Transparent Systems, Special Counsel at Cooley LLP, and co-founder of Bitcoin Foundation. Advisor to IMF and Federal Reserve Bank of NY. Affiliate with Berkman Klein Center at Harvard and MIT-DCI.",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Bradley Gibson",
    title: "Chief Technology Officer",
    bio: "Previously VP of Engineering at Transparent Systems. CEO at Human Enginuity and Co-Founder & CTO at LearnBIG (Acquired).",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Bethany Wheeler",
    title: "Chief Trust Officer",
    bio: "Previously, Chief Trust Officer at Paxos. Founder of Fiduciary Management Solutions. More than thirty years of experience in the trust industry.",
    linkedin: "#"
  },
  {
    name: "Jennifer Hoopes",
    title: "Chief Legal Officer",
    bio: "Previously, General Counsel at FarmTogether. Former General Counsel at Foreside Financial Group",
    linkedin: "#"
  },
  {
    name: "Melissa Wisner",
    title: "Chief Compliance & BSA Officer",
    bio: "Previously Vice President of Crypto Risk at Mastercard, with extensive experience in crypto (Paxos) and compliance (HSBC). Former official at U.S. Treasury.",
    linkedin: "#"
  },
  {
    name: "Tyler Whirty",
    title: "Chief of Staff",
    bio: "Previously, investment associate at Plural VC. Former founder of HODLpac and research associate at the Cato Institute's Center for Monetary and Financial Alternatives.",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Nate Flint",
    title: "Senior Software Engineer",
    bio: "Previously, Senior Engineer at Transparent Systems. Former Senior Software Engineer at Parametric. Drawn to the world changing potential of Bitcoin.",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Ava Trogus",
    title: "Senior Software Engineer",
    bio: "Previously, software engineer at Transparent Systems.",
    linkedin: "#"
  },
  {
    name: "Kyrha Ruff",
    title: "Business Development & Marketing",
    bio: "Investment Associate at Plural VC. Previously, Director of Brand Operations and Programming at The Post. Former Documentary Development Coordinator at Imagine Entertainment.",
    linkedin: "#",
    twitter: "#"
  }
];

export default function About(): JSX.Element {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Us</h1>
          <p className="about-hero-description">
            Surus powers onchain finance by providing builders with regulated infrastructure 
            that bridges traditional and digital assets.
          </p>
        </div>
      </section>

      <section className="team-section">
        <div className="team-container">
          <h2>Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.name} className="team-member">
                <div className="team-member-content">
                  <h3 className="team-member-name">{member.name}</h3>
                  <h4 className="team-member-title">{member.title}</h4>
                  <p className="team-member-bio">{member.bio}</p>
                  <div className="team-member-links">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener" className="social-link">
                        <span className="social-icon">in</span>
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noopener" className="social-link">
                        <span className="social-icon">𝕏</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="investors-section">
        <div className="investors-container">
          <h2>Our Investors</h2>
          <div className="investors-grid">
            <div className="investor-logos">
              <p className="investors-placeholder">
                Backed by leading investors including Castle Island Ventures, Plural, Protocol VC, and Protagonist.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-cta">
        <div className="contact-cta-content">
          <h2>Get in Touch</h2>
          <p>Let's talk about how Surus can support your business</p>
          <a href="mailto:hello@surus.io" className="contact-button">Contact Us</a>
        </div>
      </section>

      <section className="about-footer-info">
        <div className="footer-info-content">
          <p>
            Surus is an institutional-grade asset management, custody, and compliance platform 
            for the future of finance, built on top of our licensed and regulated financial 
            institution: Surus Trust Company.
          </p>
        </div>
      </section>
    </>
  );
}


