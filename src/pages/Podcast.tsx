import React, { useEffect, useState } from 'react';

type Episode = {
  episode_number?: number | string | null;
  title: string;
  date?: string;
  description?: string;
  guest?: string;
  image?: string;
  spotify_url?: string;
  apple_url?: string;
  amazon_url?: string;
  libsyn_url?: string;
  duration?: string;
};

export default function Podcast(): JSX.Element {
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/podcast.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(setEpisodes)
      .catch(err => setError(String(err)));
  }, []);

  return (
    <>
      <section className="page-header">
        <h1>Form &amp; Structure Podcast</h1>
        <p>Exploring the intersection of law, technology, and finance with industry experts and thought leaders.</p>
      </section>

      <section className="podcast-grid" id="podcast-episodes">
        {error && <div className="error">Error loading episodes.</div>}
        {!error && episodes === null && <div className="loading">Loading podcast episodes...</div>}
        {!error && episodes && episodes.length === 0 && <div className="no-episodes">No episodes yet. Check back soon!</div>}
        {!error && episodes && episodes.map((episode) => {
          const links = [
            episode.spotify_url ? <a key="spotify" href={episode.spotify_url} className="podcast-link spotify" target="_blank" rel="noopener">🎵 Spotify</a> : null,
            episode.apple_url ? <a key="apple" href={episode.apple_url} className="podcast-link apple" target="_blank" rel="noopener">🎧 Apple</a> : null,
            episode.amazon_url ? <a key="amazon" href={episode.amazon_url} className="podcast-link amazon" target="_blank" rel="noopener">🎙️ Amazon</a> : null,
            episode.libsyn_url ? <a key="listen" href={episode.libsyn_url} className="podcast-link" target="_blank" rel="noopener">🔊 Listen</a> : null,
          ].filter(Boolean);

          return (
            <article key={(episode.title) + (episode.date ?? '')} className="podcast-card">
              {episode.image && <img src={episode.image} alt={episode.title} className="podcast-image" />}
              <div className="podcast-content">
                <div className="podcast-meta">
                  <span className="episode-number">{episode.episode_number ? `Episode ${episode.episode_number}` : ''}</span>
                  <span className="podcast-date">{episode.date ? new Date(episode.date).toLocaleDateString() : ''}</span>
                </div>
                <h2 className="podcast-title">{episode.title}</h2>
                {episode.guest && <p className="podcast-guest">Guest: {episode.guest}</p>}
                {episode.description && <p className="podcast-description">{episode.description}</p>}
                {links.length > 0 && <div className="podcast-links">{links}</div>}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}


