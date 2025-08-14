import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PodcastEpisode } from '../types/content';

export default function PodcastDetail(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEpisode = async (): Promise<void> => {
      try {
        const timestamp = Date.now();
        const response = await fetch(`/data/podcast.json?v=${timestamp}`, { cache: 'no-cache' });
        if (response.ok) {
          const episodes: PodcastEpisode[] = await response.json();
          const foundEpisode = episodes.find(e => e.slug === slug);
          if (foundEpisode) {
            setEpisode(foundEpisode);
          } else {
            setError('Podcast episode not found');
          }
        } else {
          setError('Failed to load podcast episodes');
        }
      } catch (err) {
        setError('Error loading podcast episode');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadEpisode();
    } else {
      setError('No podcast episode specified');
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <section className="detail-loading">
        <div className="loading">Loading podcast episode...</div>
      </section>
    );
  }

  if (error || !episode) {
    return (
      <section className="detail-error">
        <div className="error-content">
          <h1>Podcast Episode Not Found</h1>
          <p>{error || 'The requested podcast episode could not be found.'}</p>
          <Link to="/insights" className="back-link">← Back to Insights</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="detail-header">
        <div className="detail-container">
          <Link to="/insights" className="back-link">← Back to Insights</Link>
          <div className="detail-meta">
            <span className="detail-type">Form & Structure Podcast</span>
            <span className="detail-episode">Episode #{episode.episodeNumber}</span>
            <span className="detail-date">
              {episode.publishDate ? new Date(episode.publishDate).toLocaleDateString() : ''}
            </span>
          </div>
          <h1 className="detail-title">{episode.title}</h1>
          {episode.guest && (
            <div className="detail-guest">
              <span className="guest-label">Guest:</span>
              <span className="guest-name">{episode.guest}</span>
              {episode.guestTitle && (
                <span className="guest-title"> • {episode.guestTitle}</span>
              )}
            </div>
          )}
          {episode.duration && (
            <div className="detail-duration">
              <span>Duration: {episode.duration}</span>
            </div>
          )}
        </div>
      </section>

      {episode.image && (
        <section className="detail-hero-image">
          <div className="detail-container">
            <img src={episode.image} alt={episode.title} />
          </div>
        </section>
      )}

      <section className="detail-content">
        <div className="detail-container">
          <article className="detail-article">
            {/* Podcast Links */}
            <div className="podcast-links">
              <h3>Listen Now</h3>
              <div className="listen-buttons">
                {episode.audioUrl && (
                  <a href={episode.audioUrl} target="_blank" rel="noopener" className="listen-btn primary">
                    🎙️ Direct Audio
                  </a>
                )}
                {episode.spotifyUrl && (
                  <a href={episode.spotifyUrl} target="_blank" rel="noopener" className="listen-btn spotify">
                    🎵 Spotify
                  </a>
                )}
                {episode.appleUrl && (
                  <a href={episode.appleUrl} target="_blank" rel="noopener" className="listen-btn apple">
                    🎧 Apple Podcasts
                  </a>
                )}
                {episode.amazonUrl && (
                  <a href={episode.amazonUrl} target="_blank" rel="noopener" className="listen-btn amazon">
                    🎙️ Amazon Music
                  </a>
                )}
                {episode.youtubeUrl && (
                  <a href={episode.youtubeUrl} target="_blank" rel="noopener" className="listen-btn youtube">
                    📺 YouTube
                  </a>
                )}
              </div>
            </div>

            {/* Episode Description */}
            <div className="detail-body">
              <h3>About This Episode</h3>
              {episode.description.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Transcript */}
            {episode.transcript && (
              <div className="detail-transcript">
                <h3>Transcript</h3>
                <div className="transcript-content">
                  {episode.transcript.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            
            {episode.tags && episode.tags.length > 0 && (
              <div className="detail-tags">
                <h4>Tags</h4>
                <div className="tag-list">
                  {episode.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="detail-footer">
        <div className="detail-container">
          <Link to="/insights" className="back-button">← Back to Insights</Link>
        </div>
      </section>
    </>
  );
}
