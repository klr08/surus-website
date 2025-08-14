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

// No fallback data - start with clean slate for CMS management
const fallbackTeamMembers: TeamMember[] = [];

export default function About(): JSX.Element {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(fallbackTeamMembers);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load team data from CMS-managed JSON file
    const loadTeamData = async (): Promise<void> => {
                try {
            const timestamp = Date.now();
            const response = await fetch(`/data/team.json?v=${timestamp}`, { cache: 'no-cache' });
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


