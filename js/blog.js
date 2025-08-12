// Blog content loader (no mock data)
async function loadBlogPosts() {
  const blogContainer = document.getElementById('blog-posts');
  try {
    const res = await fetch('/data/blog.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      blogContainer.innerHTML = '<p class="no-posts">No blog posts yet. Check back soon!</p>';
      return;
    }

    const postsHTML = posts.map(post => `
      <article class="blog-card">
        ${post.image ? `<img src="${post.image}" alt="${post.title}" class="blog-image">` : ''}
        <div class="blog-content">
          <div class="blog-meta">
            <span class="blog-author">${post.author || 'Surus Team'}</span>
            <span class="blog-date">${post.date ? new Date(post.date).toLocaleDateString() : ''}</span>
          </div>
          <h2 class="blog-title">
            <span>${post.title}</span>
          </h2>
          ${post.summary ? `<p class="blog-summary">${post.summary}</p>` : ''}
          ${Array.isArray(post.tags) && post.tags.length ? `
            <div class="blog-tags">
              ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>` : ''}
        </div>
      </article>
    `).join('');

    blogContainer.innerHTML = postsHTML;
  } catch (error) {
    console.error('Error loading blog posts:', error);
    blogContainer.innerHTML = '<p class="error">Error loading blog posts.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadBlogPosts);
