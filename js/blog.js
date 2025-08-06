// Blog content loader
async function loadBlogPosts() {
    try {
        const blogContainer = document.getElementById('blog-posts');
        
        // Your actual blog posts from the CMS content you added
        const posts = [
            {
                title: "Surus Joins the Tokenized Asset Coalition",
                date: "2025-07-31",
                author: "Surus Team",
                summary: "Surus is one of 24 new members to join the organization that aims to drive more than $1 trillion in assets onchain.",
                slug: "surus-joins-tokenized-asset-coalition",
                tags: ["press release", "partnership"],
                image: "https://cdn.prod.website-files.com/663ffb54d48ced9107d1a30b/688b8931b31d165cabc87096_X%20Post%20Images.png"
            },
            {
                title: "Surus Partners with Etherfuse to Power Regulated, Onchain Stablebonds",
                date: "2025-06-18",
                author: "Surus Team",
                summary: "Surus is pleased to announce a new partnership with Etherfuse—a pioneer in tokenizing sovereign debt and building interest-bearing stablecoins.",
                slug: "surus-partners-etherfuse-regulated-stablebonds",
                tags: ["press release", "partnership"],
                image: "https://cdn.prod.website-files.com/663ffb54d48ced9107d1a30b/6851db291cb3a9283b31d072_ethxsurus%20lgoo*.png"
            },
            {
                title: "Surus Raises $8M Seed Round and Opens Surus Trust Company",
                date: "2025-02-13",
                author: "Surus Team",
                summary: "Surus has raised an $8 million seed round and received regulatory approval from the North Carolina Commissioner of Banks to operate as a state-chartered trust company.",
                slug: "surus-raises-8m-seed-round",
                tags: ["press release", "funding"],
                image: "https://cdn.prod.website-files.com/663ffb54d48ced9107d1a30b/67ad6d58f8669ec2d385f1c6_Untitled%20design%20(3).png"
            }
        ];
        
        if (posts.length === 0) {
            blogContainer.innerHTML = '<p class="no-posts">No blog posts yet. Check back soon!</p>';
            return;
        }
        
        const postsHTML = posts.map(post => `
            <article class="blog-card">
                ${post.image ? `<img src="${post.image}" alt="${post.title}" class="blog-image">` : ''}
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-author">${post.author}</span>
                        <span class="blog-date">${new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <h2 class="blog-title">
                        <a href="#" onclick="alert('Individual blog post pages coming soon!')">${post.title}</a>
                    </h2>
                    <p class="blog-summary">${post.summary}</p>
                    <div class="blog-tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
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
