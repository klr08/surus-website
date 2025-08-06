// Podcast episodes loader
async function loadPodcastEpisodes() {
    try {
        const podcastContainer = document.getElementById('podcast-episodes');
        
        // Your actual podcast episodes from the CMS content
        const episodes = [
            {
                episode_number: 12,
                title: "[Ep. #12] What Is a Payment, Really?",
                date: "2025-04-02",
                description: "In this episode, Patrick Murck is joined by Jess Cheng, partner at Wilson Sonsini (Ex-Federal Reserve, IMF, and Ripple). Jess brings decades of experience to break down what a payment actually is—and how crypto is forcing builders and infrastructure players to rethink how money moves.",
                guest: "Jess Cheng",
                image: "https://cdn.prod.website-files.com/663ffb54d48ced9107d1a30b/67ed5e7c0b6336061b140b99_Episode%20%2312_Guest%20Cover.png"
            },
            {
                episode_number: 11,
                title: "[Ep. #11] Crypto, Compliance, and the $18 Trillion Blind Spot",
                date: "2025-03-27",
                description: "What if the current anti-money laundering system doesn't work—not just for crypto, but for anyone? In this episode, Patrick Murck sits down with Rebecca Rettig and Mike Mosier to discuss the real limitations of today's compliance frameworks.",
                guest: "Rebecca Rettig & Mike Mosier",
                image: "https://cdn.prod.website-files.com/663ffb54d48ced9107d1a30b/67e63c7fb1de9ee05d78e89f_Episode%20%2311_Guest%20Cover.png"
            },
            {
                episode_number: 10,
                title: "[Ep. #10] Bitcoin Covenants & Collider Script",
                date: "2025-03-19",
                description: "In this episode, Patrick Murck sits down with Ethan Heilman, Research Engineer at Cloudflare and Bitcoin Research Collaborator at MIT DCI, to discuss the complexities of Bitcoin's scripting limitations and how Collider Script is pushing the boundaries of what's possible with Bitcoin covenants.",
                guest: "Ethan Heilman",
                image: "https://cdn.prod.website-files.com/663ffb54d48ced9107d1a30b/67db7ac1b1de9ee05d764d80_Episode%20%2310_Guest%20Cover.png"
            }
        ];
        
        if (episodes.length === 0) {
            podcastContainer.innerHTML = '<p class="no-episodes">No episodes yet. Check back soon!</p>';
            return;
        }
        
        const episodesHTML = episodes.map(episode => `
            <article class="podcast-card">
                <img src="${episode.image}" alt="${episode.title}" class="podcast-image">
                <div class="podcast-content">
                    <div class="podcast-meta">
                        <span class="episode-number">Episode ${episode.episode_number}</span>
                        <span class="podcast-date">${new Date(episode.date).toLocaleDateString()}</span>
                    </div>
                    <h2 class="podcast-title">${episode.title}</h2>
                    ${episode.guest ? `<p class="podcast-guest">Guest: ${episode.guest}</p>` : ''}
                    <p class="podcast-description">${episode.description}</p>
                    <div class="podcast-links">
                        <a href="#" class="podcast-link spotify" onclick="alert('Add your Spotify link in the CMS!')">🎵 Spotify</a>
                        <a href="#" class="podcast-link apple" onclick="alert('Add your Apple Podcasts link in the CMS!')">🎧 Apple</a>
                        <a href="#" class="podcast-link amazon" onclick="alert('Add your Amazon Music link in the CMS!')">🎙️ Amazon</a>
                    </div>
                </div>
            </article>
        `).join('');
        
        podcastContainer.innerHTML = episodesHTML;
        
    } catch (error) {
        console.error('Error loading podcast episodes:', error);
        document.getElementById('podcast-episodes').innerHTML = '<p class="error">Error loading episodes.</p>';
    }
}

// Load episodes when page loads
document.addEventListener('DOMContentLoaded', loadPodcastEpisodes);
