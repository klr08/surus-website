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
  previewDescription?: string;
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

  // Find featured post (if any)
  const featuredPost = sortedInsights.find(item => item.featured) || sortedInsights[0];
  
  // Remove featured post from the list of other posts
  const otherPosts = featuredPost 
    ? sortedInsights.filter(item => item !== featuredPost)
    : sortedInsights.slice(1);
  
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

      {/* Featured Post */}
      {featuredPost && (
        <section className="featured-post-section">
          <div className="featured-post-container">
            <h2>Featured Post</h2>
            <p className="featured-subtitle">This is the subtitle</p>
            <Link 
              to={`/insights/${featuredPost.type}/${featuredPost.slug}`}
              className="featured-post-link"
            >
              <article className="featured-post">
                <div className="featured-image">
                  {featuredPost.image && (
                    <img src={featuredPost.image} alt={featuredPost.title} />
                  )}
                </div>
                <div className="featured-content">
                  <h3 className="featured-title">{featuredPost.title}</h3>
                  <div className="featured-meta">
                    <span className="featured-author">
                      {featuredPost.type === 'blog' 
                        ? (featuredPost as BlogPost).author || 'Surus Team'
                        : `Patrick Murck${(featuredPost as Episode).guest ? ` hosts ${(featuredPost as Episode).guest}` : ''}`
                      }
                    </span>
                    <span className="featured-date">
                      {featuredPost.date ? new Date(featuredPost.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : ''}
                    </span>
                  </div>
                                      <p className="featured-description">
                      {featuredPost.type === 'blog' 
                        ? (featuredPost as BlogPost).summary
                        : (featuredPost as Episode).previewDescription || (featuredPost as Episode).description.substring(0, 150) + '...'
                      }
                    </p>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section className="all-posts-section">
        <div className="all-posts-container">
          <div className="posts-grid">
            {otherPosts.map((item) => (
              <Link 
                key={item.title + (item.date || '')}
                to={`/insights/${item.type}/${item.slug}`}
                className="post-card-link"
              >
                <article className="post-card">
                  {item.image && (
                    <div className="post-image">
                      <img src={item.image} alt={item.title} />
                    </div>
                  )}
                  <div className="post-content">
                    <h3 className="post-title">{item.title}</h3>
                    <div className="post-meta">
                      <span className="post-author">
                        {item.type === 'blog' 
                          ? (item as BlogPost).author || 'Surus Team'
                          : `Patrick Murck${(item as Episode).guest ? ` hosts ${(item as Episode).guest}` : ''}`
                        }
                      </span>
                      <span className="post-date">
                        {item.date ? new Date(item.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'numeric', 
                          day: 'numeric' 
                        }) : ''}
                      </span>
                    </div>
                    <p className="post-description">
                      {item.type === 'blog' 
                        ? (item as BlogPost).summary
                        : (item as Episode).previewDescription || (item as Episode).description.substring(0, 150) + '...'
                      }
                    </p>
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
