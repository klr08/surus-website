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

  // Sort all items by date
  const sortedInsights = insights.sort((a, b) => 
    new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
  );

  return (
    <>
      {/* Page Header */}
      <section className="insights-hero">
        <div className="insights-hero-content">
          <h1>Insights</h1>
          <p className="insights-subtitle">
            Podcast episodes, blog posts, and announcements from the Surus team
          </p>
        </div>
      </section>

      {/* Podcast Section */}
      <section className="podcast-section">
        <div className="podcast-section-content">
          <h2>Listen to Form & Structure</h2>
          <p className="podcast-description">
            Hosted by Surus CEO, Patrick Murck, the Form & Structure podcast explores the intersection of policy, technology, and financial innovation.
          </p>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="recent-posts">
        <div className="recent-posts-content">
          <h2>Recent Posts</h2>
          <div className="posts-grid">
            {sortedInsights.map((item) => (
              <Link 
                key={item.title + (item.date || '')}
                to={`/insights/${item.type}/${item.slug}`}
                className="post-card-link"
              >
                <article className="post-card">
                  <div className="post-header">
                    <h3 className="post-title">{item.title}</h3>
                    <div className="post-meta">
                      <span className="post-author">
                        {item.type === 'blog' 
                          ? (item as BlogPost).author || 'Surus Team'
                          : `Patrick Murck${(item as Episode).guest ? ` hosts ${(item as Episode).guest}` : ''}`
                        }
                      </span>
                      <span className="post-description">
                        {item.type === 'blog' 
                          ? (item as BlogPost).summary
                          : (item as Episode).description
                        }
                      </span>
                    </div>
                  </div>
                  <div className="post-footer">
                    <span className="post-type">
                      {item.type === 'blog' ? 'Blog Post' : 'Podcast'}
                    </span>
                    <span className="post-date">
                      {item.date ? new Date(item.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : ''}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
