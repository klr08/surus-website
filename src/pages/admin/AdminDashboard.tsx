import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentSummary } from '../../types/content';

export default function AdminDashboard(): JSX.Element {
  const [summary, setSummary] = useState<ContentSummary>({
    blogPosts: 0,
    podcastEpisodes: 0,
    teamMembers: 0,
    mediaFiles: 0,
  });

  useEffect(() => {
    // Load content summary from actual data files
    const loadSummary = async (): Promise<void> => {
      try {
        const timestamp = Date.now();
        // Load blog posts
        const blogResponse = await fetch(`/data/blog.json?v=${timestamp}`, { cache: 'no-cache' });
        const blogData = blogResponse.ok ? await blogResponse.json() : [];
        
        // Load podcast episodes
        const podcastResponse = await fetch(`/data/podcast.json?v=${timestamp}`, { cache: 'no-cache' });
        const podcastData = podcastResponse.ok ? await podcastResponse.json() : [];

        setSummary({
          blogPosts: blogData.length || 0,
          podcastEpisodes: podcastData.length || 0,
          teamMembers: 9, // From About page
          mediaFiles: 0, // TODO: implement media storage
        });
      } catch (error) {
        console.error('Error loading content summary:', error);
        // Fallback to default values
        setSummary({
          blogPosts: 4,
          podcastEpisodes: 7,
          teamMembers: 9,
          mediaFiles: 0,
        });
      }
    };

    loadSummary();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Content Management Dashboard</h1>
        <p>Manage your Surus website content</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{summary.blogPosts}</div>
          <div className="stat-label">Blog Posts</div>
          <Link to="/admin/blog" className="stat-link">Manage →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-number">{summary.podcastEpisodes}</div>
          <div className="stat-label">Podcast Episodes</div>
          <Link to="/admin/podcast" className="stat-link">Manage →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-number">{summary.teamMembers}</div>
          <div className="stat-label">Team Members</div>
          <Link to="/admin/team" className="stat-link">Manage →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-number">{summary.mediaFiles}</div>
          <div className="stat-label">Media Files</div>
          <Link to="/admin/media" className="stat-link">Manage →</Link>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/admin/blog/new" className="action-card">
            <h3>New Blog Post</h3>
            <p>Create a new blog post with rich content</p>
          </Link>

          <Link to="/admin/podcast/new" className="action-card">
            <h3>New Podcast Episode</h3>
            <p>Add a new podcast episode with guest info and links</p>
          </Link>

          <Link to="/admin/team/new" className="action-card">
            <h3>Add Team Member</h3>
            <p>Add a new team member with bio and photo</p>
          </Link>

          <Link to="/admin/media" className="action-card">
            <h3>Upload Media</h3>
            <p>Manage images, audio files, and other media</p>
          </Link>
        </div>
      </div>

      <div className="dashboard-recent">
        <h2>Recent Activity</h2>
        <div className="recent-placeholder">
          <p>Recent content changes will appear here</p>
        </div>
      </div>

      <div className="dashboard-help">
        <h2>Getting Started</h2>
        <div className="help-grid">
          <div className="help-card">
            <h4>Content Workflow</h4>
            <p>Create → Edit → Publish → Deploy to update the main website</p>
          </div>
          <div className="help-card">
            <h4>Current Data</h4>
            <p>Content is loaded from existing /data/*.json files and About page</p>
          </div>
        </div>
      </div>
    </div>
  );
}
