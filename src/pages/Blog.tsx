import React, { useEffect, useState } from 'react';

type BlogPost = {
  title: string;
  date?: string;
  author?: string;
  summary?: string;
  tags?: string[];
  image?: string;
  slug?: string;
};

export default function Blog(): JSX.Element {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/blog.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(setPosts)
      .catch(err => setError(String(err)));
  }, []);

  return (
    <>
      <section className="page-header">
        <h1>Insights &amp; Updates</h1>
        <p>Latest thoughts on digital asset custody, tokenization, and the future of finance.</p>
      </section>

      <section className="blog-grid" id="blog-posts">
        {error && <div className="error">Error loading blog posts.</div>}
        {!error && posts === null && <div className="loading">Loading blog posts...</div>}
        {!error && posts && posts.length === 0 && <div className="no-posts">No blog posts yet. Check back soon!</div>}
        {!error && posts && posts.map(post => (
          <article key={(post.slug ?? post.title) + (post.date ?? '')} className="blog-card">
            {post.image && <img src={post.image} alt={post.title} className="blog-image" />}
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-author">{post.author || 'Surus Team'}</span>
                <span className="blog-date">{post.date ? new Date(post.date).toLocaleDateString() : ''}</span>
              </div>
              <h2 className="blog-title"><span>{post.title}</span></h2>
              {post.summary && <p className="blog-summary">{post.summary}</p>}
              {post.tags && post.tags.length > 0 && (
                <div className="blog-tags">
                  {post.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}


