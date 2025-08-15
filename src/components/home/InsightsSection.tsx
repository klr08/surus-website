import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Episode {
  title: string;
  episodeNumber: number;
  image?: string;
  description?: string;
  slug: string;
}

const InsightsSection: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const timestamp = Date.now();
        const response = await fetch(`/data/podcast.json?v=${timestamp}`, { cache: 'no-cache' });
        if (response.ok) {
          const data = await response.json();
          // Sort by episode number (descending)
          const sortedEpisodes = data
            .sort((a: any, b: any) => b.episodeNumber - a.episodeNumber)
            .slice(0, 3); // Only take the 3 most recent episodes
          setEpisodes(sortedEpisodes);
        }
      } catch (error) {
        console.error('Error fetching podcast episodes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEpisodes();
  }, []);
  
  return (
    <section className="insights-section">
      <div className="insights-container">
        <h2 className="insights-heading">Insights</h2>
        
        {loading ? (
          <div className="insights-loading">Loading episodes...</div>
        ) : episodes.length > 0 ? (
          <div className="podcast-grid">
            {episodes.map((episode, index) => (
              <Link 
                key={index} 
                to={`/insights/podcast/${episode.slug}`}
                className="podcast-card-link"
              >
                <div className="podcast-card">
                  {episode.image && (
                    <div className="podcast-image">
                      <img src={episode.image} alt={episode.title} />
                    </div>
                  )}
                  <div className="podcast-content">
                    <div className="podcast-episode-number">EP. {episode.episodeNumber}</div>
                    <h3 className="podcast-title">{episode.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="insights-empty">No episodes available</div>
        )}
        
        <div className="insights-cta">
          <Link to="/insights" className="insights-button">
            VIEW ALL INSIGHTS
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;
