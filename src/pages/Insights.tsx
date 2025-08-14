import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type BlogPost = {
  title: string;
  date?: string;
  author?: string;
  summary?: string;
  tags?: string[];
  image?: string;
  slug?: string;
  featured?: boolean;
  type: 'blog';
};

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
  featured?: boolean;
  type: 'podcast';
};

type InsightItem = BlogPost | Episode;

export default function Insights(): JSX.Element {
  const [insights, setInsights] = useState<InsightItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timestamp = Date.now();
    Promise.all([
      fetch(`/data/blog.json?v=${timestamp}`, { cache: 'no-cache' }).then(r => r.ok ? r.json() : []),
      fetch(`/data/podcast.json?v=${timestamp}`, { cache: 'no-cache' }).then(r => r.ok ? r.json() : [])
    ])
      .then(([blogPosts, episodes]) => {
        const blogItems: BlogPost[] = blogPosts.map((post: any) => ({ ...post, type: 'blog' as const }));
        const podcastItems: Episode[] = episodes.map((episode: any) => ({ ...episode, type: 'podcast' as const }));
        
        // Combine and sort by date
        const combined = [...blogItems, ...podcastItems].sort((a, b) => 
          new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
        );
        
        setInsights(combined);
      })
      .catch(err => setError(String(err)));
  }, []);

  if (error) {
    return (
      <section className="insights-error">
        <div className="error">Error loading insights.</div>
      </section>
    );
  }

  if (!insights) {
    return (
      <section className="insights-loading">
        <div className="loading">Loading insights...</div>
      </section>
    );
  }

  const featuredItem = insights.find(item => item.featured) || insights[0];
  const otherItems = insights.filter(item => item !== featuredItem);

  return (
    <>
      <section className="insights-header">
        <h1>Blog</h1>
      </section>

      {featuredItem && (
        <section className="featured-post">
          <h2>Featured Post</h2>
          <p className="featured-subtitle">This is the subtitle</p>
          <Link 
            to={`/insights/${featuredItem.type}/${featuredItem.slug}`}
            className="featured-article-link"
          >
            <article className="featured-article">
              {featuredItem.image && (
                <div className="featured-thumbnail">
                  <img src={featuredItem.image} alt={featuredItem.title} />
                </div>
              )}
              <div className="featured-content">
                <h3 className="featured-title">{featuredItem.title}</h3>
                <div className="featured-meta">
                  <span className="featured-author">
                    {featuredItem.type === 'blog' 
                      ? (featuredItem as BlogPost).author || 'Surus Team'
                      : `Podcast${(featuredItem as Episode).guest ? ` • Guest: ${(featuredItem as Episode).guest}` : ''}`
                    }
                  </span>
                  <span className="featured-date">
                    {featuredItem.date ? new Date(featuredItem.date).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="featured-description">
                  {featuredItem.type === 'blog' 
                    ? (featuredItem as BlogPost).summary
                    : (featuredItem as Episode).description
                  }
                </p>
                {featuredItem.type === 'podcast' && (featuredItem as Episode).spotify_url && (
                  <div className="featured-links">
                    <span className="listen-indicator">🎵 Listen on Spotify</span>
                  </div>
                )}
              </div>
            </article>
          </Link>
        </section>
      )}

      <section className="insights-grid">
        {otherItems.map((item) => (
          <Link 
            key={item.title + (item.date || '')}
            to={`/insights/${item.type}/${item.slug}`}
            className="insight-card-link"
          >
            <article className="insight-card">
              {item.image && (
                <div className="insight-thumbnail">
                  <img src={item.image} alt={item.title} />
                </div>
              )}
              <div className="insight-content">
                <h3 className="insight-title">{item.title}</h3>
                <div className="insight-meta">
                  <span className="insight-author">
                    {item.type === 'blog' 
                      ? (item as BlogPost).author || 'Surus Team'
                      : `Podcast${(item as Episode).guest ? ` • ${(item as Episode).guest}` : ''}`
                    }
                  </span>
                  <span className="insight-date">
                    {item.date ? new Date(item.date).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="insight-description">
                  {item.type === 'blog' 
                    ? (item as BlogPost).summary
                    : (item as Episode).description
                  }
                </p>
                {item.type === 'podcast' && (
                  <div className="podcast-links-small">
                    <span className="listen-indicators">
                      {(item as Episode).spotify_url && <span>🎵</span>}
                      {(item as Episode).apple_url && <span>🎧</span>}
                      {(item as Episode).amazon_url && <span>🎙️</span>}
                    </span>
                  </div>
                )}
              </div>
            </article>
          </Link>
        ))}
      </section>
    </>
  );
}
