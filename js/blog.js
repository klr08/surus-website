// Blog content loader
async function loadBlogPosts() {
    try {
        // In a real implementation, this would fetch from your CMS
        // For now, we'll create a sample structure
        const blogContainer = document.getElementById('blog-posts');
        
        // Sample blog posts (these will come from your CMS later)
        const posts = [
            {
                title: "Welcome to the New Surus Blog",
                date: "2025-08-06",
                author: "Surus Team", 
                summary: "Introducing our new website with enhanced content management and pricing calculator.",
                slug: "welcome-to-new-blog",
                tags: ["announcement", "website"]
            }
        ];
        
        if (posts.length === 0) {
            blogContainer.innerHTML = '<p class="no-posts">No blog posts yet. Check back soon!</p>';
            return;
        }
        
        const postsHTML = posts.map(post => `
            <article class="blog-card">
                <div class="blog-meta">
                    <span class="blog-author">${post.author}</span>
                    <span class="blog-date">${new Date(post.date).toLocaleDateString()}</span>
                </div>
                <h2 class="blog-title">
                    <a href="blog-post.html?slug=${post.slug}">${post.title}</a>
                </h2>
                <p class="blog-summary">${post.summary}</p>
                <div class="blog-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </article>
        `).join('');
        
        blogContainer.innerHTML = postsHTML;
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        document.getElementById('blog-posts').innerHTML = '<p class="error">Error loading blog posts.</p>';
    }
}

// Load posts when page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);
