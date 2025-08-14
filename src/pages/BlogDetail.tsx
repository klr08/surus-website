import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogPost } from '../types/content';

export default function BlogDetail(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async (): Promise<void> => {
      try {
        const timestamp = Date.now();
        const response = await fetch(`/data/blog.json?v=${timestamp}`, { cache: 'no-cache' });
        if (response.ok) {
          const posts: BlogPost[] = await response.json();
          const foundPost = posts.find(p => p.slug === slug);
          if (foundPost) {
            setPost(foundPost);
          } else {
            setError('Blog post not found');
          }
        } else {
          setError('Failed to load blog posts');
        }
      } catch (err) {
        setError('Error loading blog post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    } else {
      setError('No blog post specified');
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <section className="detail-loading">
        <div className="loading">Loading blog post...</div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="detail-error">
        <div className="error-content">
          <h1>Blog Post Not Found</h1>
          <p>{error || 'The requested blog post could not be found.'}</p>
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
            <span className="detail-type">Blog Post</span>
            <span className="detail-date">
              {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : ''}
            </span>
          </div>
          <h1 className="detail-title">{post.title}</h1>
          {post.summary && (
            <p className="detail-summary">{post.summary}</p>
          )}
          <div className="detail-author">
            <span>By {post.author || 'Surus Team'}</span>
          </div>
        </div>
      </section>

      {post.image && (
        <section className="detail-hero-image">
          <div className="detail-container">
            <img src={post.image} alt={post.title} />
          </div>
        </section>
      )}

      <section className="detail-content">
        <div className="detail-container">
          <article className="detail-article">
            <div className="detail-body">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="detail-tags">
                <h4>Tags</h4>
                <div className="tag-list">
                  {post.tags.map((tag, index) => (
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
