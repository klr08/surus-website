import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ContentSummary, BlogPost, PodcastEpisode, TeamMember } from '../types/content';
import { ContentManager } from '../services/contentManager';
import { FileUploadService } from '../services/fileUpload';
import RichTextEditor from '../components/admin/RichTextEditor';
import FileUpload from '../components/admin/FileUpload';

type TabType = 'dashboard' | 'blog' | 'podcast' | 'team' | 'media';

export default function AdminEnhanced(): JSX.Element {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // CMS state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [summary, setSummary] = useState<ContentSummary>({
    blogPosts: 0,
    podcastEpisodes: 0,
    teamMembers: 0,
    mediaFiles: 0,
  });

  // Content state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [podcastEpisodes, setPodcastEpisodes] = useState<PodcastEpisode[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);

  // Form state
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingPodcast, setEditingPodcast] = useState<PodcastEpisode | null>(null);
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);

  // Blog form state
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    author: 'Surus Team',
    summary: '',
    content: '',
    image: '',
    tags: '',
    featured: false,
    published: false,
    publishDate: new Date().toISOString().split('T')[0] || '',
  });

  // Podcast form state
  const [podcastForm, setPodcastForm] = useState({
    episodeNumber: 1,
    title: '',
    slug: '',
    description: '',
    guest: '',
    guestTitle: '',
    duration: '',
    image: '',
    audioUrl: '',
    spotifyUrl: '',
    appleUrl: '',
    amazonUrl: '',
    youtubeUrl: '',
    transcript: '',
    tags: '',
    featured: false,
    published: false,
    publishDate: new Date().toISOString().split('T')[0] || '',
  });

  // Team form state
  const [teamForm, setTeamForm] = useState({
    name: '',
    title: '',
    bio: '',
    order: 1,
    image: '',
    linkedinUrl: '',
    twitterUrl: '',
    active: true,
  });

  // Check authentication on mount
  useEffect(() => {
    const authData = localStorage.getItem('surus_admin_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const isValid = parsed.token && parsed.expires > Date.now();
        setIsAuthenticated(isValid);
      } catch {
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  // Load content when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllContent();
    }
  }, [isAuthenticated]);

  const loadAllContent = (): void => {
    const blogs = ContentManager.getBlogPosts();
    const podcasts = ContentManager.getPodcastEpisodes();
    const team = ContentManager.getTeamMembers();
    const media = FileUploadService.getFiles();

    setBlogPosts(blogs);
    setPodcastEpisodes(podcasts);
    setTeamMembers(team);
    setMediaFiles(media);

    setSummary({
      blogPosts: blogs.length,
      podcastEpisodes: podcasts.length,
      teamMembers: team.length,
      mediaFiles: media.length,
    });
  };

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      if (credentials.email === 'admin@surus.io' && credentials.password === 'surus2025!') {
        localStorage.setItem('surus_admin_auth', JSON.stringify({
          user: { id: '1', email: credentials.email, role: 'admin' },
          token: 'demo-token',
          expires: Date.now() + (24 * 60 * 60 * 1000)
        }));
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid email or password');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem('surus_admin_auth');
    setIsAuthenticated(false);
    setCredentials({ email: '', password: '' });
    setActiveTab('dashboard');
  };

  // Blog handlers
  const handleSaveBlog = (): void => {
    const result = editingBlog 
      ? ContentManager.updateBlogPost(editingBlog.id, blogForm)
      : ContentManager.saveBlogPost(blogForm);

    if (result.success) {
      loadAllContent();
      resetBlogForm();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const resetBlogForm = (): void => {
    setBlogForm({
      title: '',
      slug: '',
      author: 'Surus Team',
      summary: '',
      content: '',
      image: '',
      tags: '',
      featured: false,
      published: false,
      publishDate: new Date().toISOString().split('T')[0] || '',
    });
    setEditingBlog(null);
    setShowBlogForm(false);
  };

  const handleEditBlog = (blog: BlogPost): void => {
    setBlogForm({
      title: blog.title,
      slug: blog.slug,
      author: blog.author,
      summary: blog.summary,
      content: blog.content,
      image: blog.image || '',
      tags: blog.tags.join(', '),
      featured: blog.featured,
      published: blog.published,
      publishDate: blog.publishDate.split('T')[0] || '',
    });
    setEditingBlog(blog);
    setShowBlogForm(true);
  };

  const handleDeleteBlog = (id: string): void => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      ContentManager.deleteBlogPost(id);
      loadAllContent();
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (blogForm.title && !editingBlog) {
      const slug = blogForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setBlogForm(prev => ({ ...prev, slug }));
    }
  }, [blogForm.title, editingBlog]);

  // Auto-generate slug for podcast from title
  useEffect(() => {
    if (podcastForm.title && !editingPodcast) {
      const slug = podcastForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setPodcastForm(prev => ({ ...prev, slug }));
    }
  }, [podcastForm.title, editingPodcast]);

  // Similar handlers for podcast and team (simplified for brevity)
  const handleSavePodcast = (): void => {
    const episodeData = {
      ...podcastForm,
      tags: podcastForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    const result = editingPodcast 
      ? ContentManager.updatePodcastEpisode(editingPodcast.id, episodeData)
      : ContentManager.savePodcastEpisode(episodeData);

    if (result.success) {
      loadAllContent();
      resetPodcastForm();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const resetPodcastForm = (): void => {
    setPodcastForm({
      episodeNumber: Math.max(...podcastEpisodes.map(e => e.episodeNumber), 0) + 1,
      title: '',
      slug: '',
      description: '',
      guest: '',
      guestTitle: '',
      duration: '',
      image: '',
      audioUrl: '',
      spotifyUrl: '',
      appleUrl: '',
      amazonUrl: '',
      youtubeUrl: '',
      transcript: '',
      tags: '',
      featured: false,
      published: false,
      publishDate: new Date().toISOString().split('T')[0] || '',
    });
    setEditingPodcast(null);
    setShowPodcastForm(false);
  };

  const handleSaveTeam = (): void => {
    const result = editingTeam 
      ? ContentManager.updateTeamMember(editingTeam.id, teamForm)
      : ContentManager.saveTeamMember(teamForm);

    if (result.success) {
      loadAllContent();
      resetTeamForm();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const resetTeamForm = (): void => {
    setTeamForm({
      name: '',
      title: '',
      bio: '',
      order: Math.max(...teamMembers.map(m => m.order), 0) + 1,
      image: '',
      linkedinUrl: '',
      twitterUrl: '',
      active: true,
    });
    setEditingTeam(null);
    setShowTeamForm(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading admin...</p>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <h1>Surus Admin</h1>
            <p>Sign in to manage content</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && <div className="error-message">{loginError}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="admin@surus.io"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="login-btn"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-help">
            <p>Demo credentials:</p>
            <p><strong>Email:</strong> admin@surus.io</p>
            <p><strong>Password:</strong> surus2025!</p>
          </div>

          <div className="login-footer">
            <Link to="/">← Back to Website</Link>
          </div>
        </div>
      </div>
    );
  }

  // Main CMS interface
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-logo">Surus CMS</h1>
          <nav className="admin-nav">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={activeTab === 'dashboard' ? 'active' : ''}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('blog')}
              className={activeTab === 'blog' ? 'active' : ''}
            >
              Blog ({summary.blogPosts})
            </button>
            <button 
              onClick={() => setActiveTab('podcast')}
              className={activeTab === 'podcast' ? 'active' : ''}
            >
              Podcast ({summary.podcastEpisodes})
            </button>
            <button 
              onClick={() => setActiveTab('team')}
              className={activeTab === 'team' ? 'active' : ''}
            >
              Team ({summary.teamMembers})
            </button>
            <button 
              onClick={() => setActiveTab('media')}
              className={activeTab === 'media' ? 'active' : ''}
            >
              Media ({summary.mediaFiles})
            </button>
          </nav>
          <div className="admin-user">
            <Link to="/" className="view-site">View Site</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-content">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <div className="dashboard-header">
                <h1>Content Management Dashboard</h1>
                <p>Manage your Surus website content</p>
              </div>

              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-number">{summary.blogPosts}</div>
                  <div className="stat-label">Blog Posts</div>
                  <button onClick={() => setActiveTab('blog')} className="stat-link">Manage →</button>
                </div>

                <div className="stat-card">
                  <div className="stat-number">{summary.podcastEpisodes}</div>
                  <div className="stat-label">Podcast Episodes</div>
                  <button onClick={() => setActiveTab('podcast')} className="stat-link">Manage →</button>
                </div>

                <div className="stat-card">
                  <div className="stat-number">{summary.teamMembers}</div>
                  <div className="stat-label">Team Members</div>
                  <button onClick={() => setActiveTab('team')} className="stat-link">Manage →</button>
                </div>

                <div className="stat-card">
                  <div className="stat-number">{summary.mediaFiles}</div>
                  <div className="stat-label">Media Files</div>
                  <button onClick={() => setActiveTab('media')} className="stat-link">Manage →</button>
                </div>
              </div>

              <div className="dashboard-actions">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                  <button 
                    onClick={() => {
                      setActiveTab('blog');
                      setShowBlogForm(true);
                    }}
                    className="action-card"
                  >
                    <h3>New Blog Post</h3>
                    <p>Create a new blog post with rich content</p>
                  </button>

                  <button 
                    onClick={() => {
                      setActiveTab('podcast');
                      setShowPodcastForm(true);
                    }}
                    className="action-card"
                  >
                    <h3>New Podcast Episode</h3>
                    <p>Add a new podcast episode with guest info and links</p>
                  </button>

                  <button 
                    onClick={() => {
                      setActiveTab('team');
                      setShowTeamForm(true);
                    }}
                    className="action-card"
                  >
                    <h3>Add Team Member</h3>
                    <p>Add a new team member with bio and photo</p>
                  </button>

                  <button 
                    onClick={() => setActiveTab('media')}
                    className="action-card"
                  >
                    <h3>Upload Media</h3>
                    <p>Manage images, audio files, and other media</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Blog Tab */}
          {activeTab === 'blog' && (
            <div className="content-section">
              <div className="content-header">
                <h2>Blog Posts</h2>
                <button 
                  onClick={() => setShowBlogForm(true)}
                  className="btn btn-primary"
                >
                  New Blog Post
                </button>
              </div>

              {showBlogForm && (
                <div className="content-form">
                  <div className="form-header">
                    <h3>{editingBlog ? 'Edit Blog Post' : 'New Blog Post'}</h3>
                    <button onClick={resetBlogForm} className="btn btn-secondary">Cancel</button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        value={blogForm.title}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Blog post title"
                      />
                    </div>

                    <div className="form-group">
                      <label>Slug *</label>
                      <input
                        type="text"
                        value={blogForm.slug}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="url-slug"
                      />
                    </div>

                    <div className="form-group">
                      <label>Author</label>
                      <input
                        type="text"
                        value={blogForm.author}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, author: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Publish Date</label>
                      <input
                        type="date"
                        value={blogForm.publishDate}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, publishDate: e.target.value }))}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Summary *</label>
                      <textarea
                        value={blogForm.summary}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Brief summary for the blog post"
                        rows={3}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Featured Image</label>
                      <FileUpload
                        onUpload={(url) => setBlogForm(prev => ({ ...prev, image: url }))}
                        accept="image/*"
                        label="Upload Blog Image"
                      />
                      {blogForm.image && (
                        <div className="image-preview">
                          <img src={blogForm.image} alt="Blog preview" />
                          <button 
                            type="button"
                            onClick={() => setBlogForm(prev => ({ ...prev, image: '' }))}
                            className="remove-image"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="form-group full-width">
                      <label>Content *</label>
                      <RichTextEditor
                        value={blogForm.content}
                        onChange={(content) => setBlogForm(prev => ({ ...prev, content }))}
                        placeholder="Write your blog post content here. Markdown is supported."
                      />
                    </div>

                    <div className="form-group">
                      <label>Tags</label>
                      <input
                        type="text"
                        value={blogForm.tags}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>

                    <div className="form-group">
                      <div className="checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={blogForm.featured}
                            onChange={(e) => setBlogForm(prev => ({ ...prev, featured: e.target.checked }))}
                          />
                          Featured Post
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={blogForm.published}
                            onChange={(e) => setBlogForm(prev => ({ ...prev, published: e.target.checked }))}
                          />
                          Published
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button onClick={handleSaveBlog} className="btn btn-primary">
                      {editingBlog ? 'Update Post' : 'Create Post'}
                    </button>
                    <button onClick={resetBlogForm} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="content-list">
                {blogPosts.map((post) => (
                  <div key={post.id} className="content-item">
                    <div className="content-info">
                      <h4>{post.title}</h4>
                      <p>{post.summary}</p>
                      <div className="content-meta">
                        <span>By {post.author}</span>
                        <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                        <span className={`status ${post.published ? 'published' : 'draft'}`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="content-actions">
                      <button 
                        onClick={() => handleEditBlog(post)}
                        className="btn btn-small"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBlog(post.id)}
                        className="btn btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {blogPosts.length === 0 && (
                  <div className="empty-state">
                    <p>No blog posts yet. Create your first one!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Podcast Tab */}
          {activeTab === 'podcast' && (
            <div className="content-section">
              <div className="content-header">
                <h2>Podcast Episodes</h2>
                <button 
                  onClick={() => setShowPodcastForm(true)}
                  className="btn btn-primary"
                >
                  New Episode
                </button>
              </div>

              {showPodcastForm && (
                <div className="content-form">
                  <div className="form-header">
                    <h3>{editingPodcast ? 'Edit Episode' : 'New Podcast Episode'}</h3>
                    <button onClick={resetPodcastForm} className="btn btn-secondary">Cancel</button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Episode Number *</label>
                      <input
                        type="number"
                        value={podcastForm.episodeNumber}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, episodeNumber: parseInt(e.target.value) || 1 }))}
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Duration</label>
                      <input
                        type="text"
                        value={podcastForm.duration}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="45:30"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Episode Title *</label>
                      <input
                        type="text"
                        value={podcastForm.title}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Episode title"
                      />
                    </div>

                    <div className="form-group">
                      <label>Guest Name</label>
                      <input
                        type="text"
                        value={podcastForm.guest}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, guest: e.target.value }))}
                        placeholder="Guest name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Guest Title</label>
                      <input
                        type="text"
                        value={podcastForm.guestTitle}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, guestTitle: e.target.value }))}
                        placeholder="CEO at Company"
                      />
                    </div>

                    <div className="form-group">
                      <label>Publish Date</label>
                      <input
                        type="date"
                        value={podcastForm.publishDate}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, publishDate: e.target.value }))}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Episode Description *</label>
                      <RichTextEditor
                        value={podcastForm.description}
                        onChange={(description) => setPodcastForm(prev => ({ ...prev, description }))}
                        placeholder="Write the episode description. You can include links to resources mentioned."
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Episode Cover Image</label>
                      <FileUpload
                        onUpload={(url) => setPodcastForm(prev => ({ ...prev, image: url }))}
                        accept="image/*"
                        label="Upload Episode Cover"
                      />
                      {podcastForm.image && (
                        <div className="image-preview">
                          <img src={podcastForm.image} alt="Episode cover" />
                          <button 
                            type="button"
                            onClick={() => setPodcastForm(prev => ({ ...prev, image: '' }))}
                            className="remove-image"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Audio File URL</label>
                      <input
                        type="url"
                        value={podcastForm.audioUrl}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, audioUrl: e.target.value }))}
                        placeholder="https://audio.libsyn.com/..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Spotify URL</label>
                      <input
                        type="url"
                        value={podcastForm.spotifyUrl}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, spotifyUrl: e.target.value }))}
                        placeholder="https://open.spotify.com/episode/..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Apple Podcasts URL</label>
                      <input
                        type="url"
                        value={podcastForm.appleUrl}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, appleUrl: e.target.value }))}
                        placeholder="https://podcasts.apple.com/..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Amazon Music URL</label>
                      <input
                        type="url"
                        value={podcastForm.amazonUrl}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, amazonUrl: e.target.value }))}
                        placeholder="https://music.amazon.com/..."
                      />
                    </div>

                    <div className="form-group">
                      <label>YouTube URL</label>
                      <input
                        type="url"
                        value={podcastForm.youtubeUrl}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Tags</label>
                      <input
                        type="text"
                        value={podcastForm.tags}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="fintech, blockchain, innovation"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Transcript (Optional)</label>
                      <textarea
                        value={podcastForm.transcript}
                        onChange={(e) => setPodcastForm(prev => ({ ...prev, transcript: e.target.value }))}
                        placeholder="Episode transcript..."
                        rows={10}
                      />
                    </div>

                    <div className="form-group">
                      <div className="checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={podcastForm.featured}
                            onChange={(e) => setPodcastForm(prev => ({ ...prev, featured: e.target.checked }))}
                          />
                          Featured Episode
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={podcastForm.published}
                            onChange={(e) => setPodcastForm(prev => ({ ...prev, published: e.target.checked }))}
                          />
                          Published
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button onClick={handleSavePodcast} className="btn btn-primary">
                      {editingPodcast ? 'Update Episode' : 'Create Episode'}
                    </button>
                    <button onClick={resetPodcastForm} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="content-list">
                {podcastEpisodes.map((episode) => (
                  <div key={episode.id} className="content-item">
                    <div className="content-info">
                      <h4>Episode {episode.episodeNumber}: {episode.title}</h4>
                      <p>{episode.description.replace(/[#*`]/g, '').slice(0, 150)}...</p>
                      <div className="content-meta">
                        <span>{episode.guest ? `Guest: ${episode.guest}` : 'Solo Episode'}</span>
                        <span>{episode.duration}</span>
                        <span>{new Date(episode.publishDate).toLocaleDateString()}</span>
                        <span className={`status ${episode.published ? 'published' : 'draft'}`}>
                          {episode.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="content-actions">
                      <button 
                        onClick={() => {
                          setPodcastForm({
                            episodeNumber: episode.episodeNumber,
                            title: episode.title,
                            slug: episode.slug,
                            description: episode.description,
                            guest: episode.guest || '',
                            guestTitle: episode.guestTitle || '',
                            duration: episode.duration,
                            image: episode.image || '',
                            audioUrl: episode.audioUrl,
                            spotifyUrl: episode.spotifyUrl || '',
                            appleUrl: episode.appleUrl || '',
                            amazonUrl: episode.amazonUrl || '',
                            youtubeUrl: episode.youtubeUrl || '',
                            transcript: episode.transcript || '',
                            tags: episode.tags.join(', '),
                            featured: episode.featured,
                            published: episode.published,
                            publishDate: episode.publishDate.split('T')[0] || '',
                          });
                          setEditingPodcast(episode);
                          setShowPodcastForm(true);
                        }}
                        className="btn btn-small"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this episode?')) {
                            ContentManager.deletePodcastEpisode(episode.id);
                            loadAllContent();
                          }
                        }}
                        className="btn btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {podcastEpisodes.length === 0 && (
                  <div className="empty-state">
                    <p>No podcast episodes yet. Create your first one!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="content-section">
              <div className="content-header">
                <h2>Team Members</h2>
                <button 
                  onClick={() => setShowTeamForm(true)}
                  className="btn btn-primary"
                >
                  Add Team Member
                </button>
              </div>

              {showTeamForm && (
                <div className="content-form">
                  <div className="form-header">
                    <h3>{editingTeam ? 'Edit Team Member' : 'Add Team Member'}</h3>
                    <button onClick={resetTeamForm} className="btn btn-secondary">Cancel</button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={teamForm.name}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-group">
                      <label>Job Title *</label>
                      <input
                        type="text"
                        value={teamForm.title}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Chief Executive Officer"
                      />
                    </div>

                    <div className="form-group">
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={teamForm.order}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                        min="1"
                        placeholder="1"
                      />
                      <small>Lower numbers appear first</small>
                    </div>

                    <div className="form-group">
                      <div className="checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={teamForm.active}
                            onChange={(e) => setTeamForm(prev => ({ ...prev, active: e.target.checked }))}
                          />
                          Active Team Member
                        </label>
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Professional Headshot</label>
                      <FileUpload
                        onUpload={(url) => setTeamForm(prev => ({ ...prev, image: url }))}
                        accept="image/*"
                        label="Upload Headshot"
                      />
                      {teamForm.image && (
                        <div className="image-preview">
                          <img src={teamForm.image} alt="Team member" />
                          <button 
                            type="button"
                            onClick={() => setTeamForm(prev => ({ ...prev, image: '' }))}
                            className="remove-image"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="form-group full-width">
                      <label>Bio Description *</label>
                      <RichTextEditor
                        value={teamForm.bio}
                        onChange={(bio) => setTeamForm(prev => ({ ...prev, bio }))}
                        placeholder="Write a professional bio for this team member. You can include career highlights, education, achievements, etc."
                      />
                    </div>

                    <div className="form-group">
                      <label>LinkedIn Profile</label>
                      <input
                        type="url"
                        value={teamForm.linkedinUrl}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div className="form-group">
                      <label>Twitter/X Profile</label>
                      <input
                        type="url"
                        value={teamForm.twitterUrl}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, twitterUrl: e.target.value }))}
                        placeholder="https://x.com/username"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button onClick={handleSaveTeam} className="btn btn-primary">
                      {editingTeam ? 'Update Team Member' : 'Add Team Member'}
                    </button>
                    <button onClick={resetTeamForm} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="content-list">
                {teamMembers
                  .sort((a, b) => a.order - b.order)
                  .map((member) => (
                    <div key={member.id} className="content-item">
                      <div className="content-info">
                        <h4>{member.name}</h4>
                        <p><strong>{member.title}</strong></p>
                        <p>{member.bio.replace(/[#*`]/g, '').slice(0, 150)}...</p>
                        <div className="content-meta">
                          <span>Order: {member.order}</span>
                          <span className={`status ${member.active ? 'published' : 'draft'}`}>
                            {member.active ? 'Active' : 'Inactive'}
                          </span>
                          {member.linkedinUrl && <span>📱 LinkedIn</span>}
                          {member.twitterUrl && <span>🐦 Twitter</span>}
                        </div>
                      </div>
                      <div className="content-actions">
                        <button 
                          onClick={() => {
                            setTeamForm({
                              name: member.name,
                              title: member.title,
                              bio: member.bio,
                              order: member.order,
                              image: member.image || '',
                              linkedinUrl: member.linkedinUrl || '',
                              twitterUrl: member.twitterUrl || '',
                              active: member.active,
                            });
                            setEditingTeam(member);
                            setShowTeamForm(true);
                          }}
                          className="btn btn-small"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this team member?')) {
                              ContentManager.deleteTeamMember(member.id);
                              loadAllContent();
                            }
                          }}
                          className="btn btn-small btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                {teamMembers.length === 0 && (
                  <div className="empty-state">
                    <p>No team members yet. Add your first one!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="content-section">
              <h2>Media Library</h2>
              <FileUpload
                onUpload={(url, filename) => {
                  console.log('Uploaded:', url, filename);
                  loadAllContent();
                }}
                accept="image/*,audio/*,video/*,.pdf"
                multiple={true}
                label="Upload Media Files"
              />
              
              <div className="media-grid">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="media-item">
                    <div className="media-preview">
                      {file.mimeType.startsWith('image/') ? (
                        <img src={file.url} alt={file.originalName} />
                      ) : (
                        <div className="file-icon">📄</div>
                      )}
                    </div>
                    <div className="media-info">
                      <h5>{file.originalName}</h5>
                      <p>{FileUploadService.formatFileSize(file.size)}</p>
                    </div>
                    <div className="media-actions">
                      <button 
                        onClick={() => navigator.clipboard.writeText(file.url)}
                        className="btn btn-small"
                      >
                        Copy URL
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Delete this file?')) {
                            FileUploadService.deleteFile(file.id);
                            loadAllContent();
                          }
                        }}
                        className="btn btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="admin-footer">
        <p>Surus CMS - Content Management System</p>
      </footer>
    </div>
  );
}
