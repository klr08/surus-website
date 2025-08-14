import React, { useEffect, useState } from 'react';

type TeamMember = {
  name: string;
  title: string;
  bio: string;
  image?: string;
  order?: number;
  linkedinUrl?: string;
  twitterUrl?: string;
  active?: boolean;
};

// Fallback team data in case team.json fails to load
const fallbackTeamMembers: TeamMember[] = [
  {
    name: "Patrick Murck",
    title: "Founder & CEO",
    bio: "Co-founder and Principal at Plural VC. Previously, President & CLO at Transparent Systems, Special Counsel at Cooley LLP, and co-founder of Bitcoin Foundation. Advisor to IMF and Federal Reserve Bank of NY. Affiliate with Berkman Klein Center at Harvard and MIT-DCI.",
    linkedinUrl: "#",
    twitterUrl: "#",
    order: 1
  },
  {
    name: "Bradley Gibson",
    title: "Chief Technology Officer",
    bio: "Previously VP of Engineering at Transparent Systems. CEO at Human Enginuity and Co-Founder & CTO at LearnBIG (Acquired).",
    linkedinUrl: "#",
    twitterUrl: "#",
    order: 2
  },
  {
    name: "Bethany Wheeler",
    title: "Chief Trust Officer",
    bio: "Previously, Chief Trust Officer at Paxos. Founder of Fiduciary Management Solutions. More than thirty years of experience in the trust industry.",
    linkedinUrl: "#",
    order: 3
  },
  {
    name: "Jennifer Hoopes",
    title: "Chief Legal Officer",
    bio: "Previously, General Counsel at FarmTogether. Former General Counsel at Foreside Financial Group",
    linkedinUrl: "#",
    order: 4
  },
  {
    name: "Melissa Wisner",
    title: "Chief Compliance & BSA Officer",
    bio: "Previously Vice President of Crypto Risk at Mastercard, with extensive experience in crypto (Paxos) and compliance (HSBC). Former official at U.S. Treasury.",
    linkedinUrl: "#",
    order: 5
  },
  {
    name: "Tyler Whirty",
    title: "Chief of Staff",
    bio: "Previously, investment associate at Plural VC. Former founder of HODLpac and research associate at the Cato Institute's Center for Monetary and Financial Alternatives.",
    linkedinUrl: "#",
    twitterUrl: "#",
    order: 6
  },
  {
    name: "Nate Flint",
    title: "Senior Software Engineer",
    bio: "Previously, Senior Engineer at Transparent Systems. Former Senior Software Engineer at Parametric. Drawn to the world changing potential of Bitcoin.",
    linkedinUrl: "#",
    twitterUrl: "#",
    order: 7
  },
  {
    name: "Ava Trogus",
    title: "Senior Software Engineer",
    bio: "Previously, software engineer at Transparent Systems.",
    linkedinUrl: "#",
    order: 8
  },
  {
    name: "Kyrha Ruff",
    title: "Business Development & Marketing",
    bio: "Investment Associate at Plural VC. Previously, Director of Brand Operations and Programming at The Post. Former Documentary Development Coordinator at Imagine Entertainment.",
    linkedinUrl: "#",
    twitterUrl: "#",
    order: 9
  }
];

export default function About(): JSX.Element {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(fallbackTeamMembers);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load team data from CMS-managed JSON file
    const loadTeamData = async (): Promise<void> => {
      try {
        const response = await fetch('/data/team.json', { cache: 'no-cache' });
        if (response.ok) {
          const teamData = await response.json();
          if (Array.isArray(teamData) && teamData.length > 0) {
            // Filter active members and sort by order
            const activeTeam = teamData
              .filter((member: any) => member.active !== false)
              .sort((a: any, b: any) => (a.order || 99) - (b.order || 99));
            setTeamMembers(activeTeam);
          }
        }
      } catch (error) {
        console.error('Failed to load team data:', error);
        // Keep fallback data
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, []);
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
            {loading ? (
              <div className="team-loading">Loading team...</div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.name} className="team-member">
                  {member.image && (
                    <div className="team-member-image">
                      <img src={member.image} alt={member.name} />
                    </div>
                  )}
                  <div className="team-member-content">
                    <h3 className="team-member-name">{member.name}</h3>
                    <h4 className="team-member-title">{member.title}</h4>
                    <p className="team-member-bio">{member.bio}</p>
                    <div className="team-member-links">
                      {member.linkedinUrl && member.linkedinUrl !== '#' && (
                        <a href={member.linkedinUrl} target="_blank" rel="noopener" className="social-link">
                          <span className="social-icon">in</span>
                        </a>
                      )}
                      {member.twitterUrl && member.twitterUrl !== '#' && (
                        <a href={member.twitterUrl} target="_blank" rel="noopener" className="social-link">
                          <span className="social-icon">𝕏</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
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


