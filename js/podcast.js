// Podcast episodes loader (no mock data; only render real links)
async function loadPodcastEpisodes() {
  const podcastContainer = document.getElementById('podcast-episodes');
  try {
    const res = await fetch('/data/podcast.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const episodes = await res.json();

    if (!Array.isArray(episodes) || episodes.length === 0) {
      podcastContainer.innerHTML = '<p class="no-episodes">No episodes yet. Check back soon!</p>';
      return;
    }

    const episodesHTML = episodes.map(episode => {
      const links = [
        episode.spotify_url ? `<a href="${episode.spotify_url}" class="podcast-link spotify" target="_blank" rel="noopener">🎵 Spotify</a>` : '',
        episode.apple_url ? `<a href="${episode.apple_url}" class="podcast-link apple" target="_blank" rel="noopener">🎧 Apple</a>` : '',
        episode.amazon_url ? `<a href="${episode.amazon_url}" class="podcast-link amazon" target="_blank" rel="noopener">🎙️ Amazon</a>` : '',
        episode.libsyn_url ? `<a href="${episode.libsyn_url}" class="podcast-link" target="_blank" rel="noopener">🔊 Listen</a>` : ''
      ].filter(Boolean).join('');

      return `
        <article class="podcast-card">
          ${episode.image ? `<img src="${episode.image}" alt="${episode.title}" class="podcast-image">` : ''}
          <div class="podcast-content">
            <div class="podcast-meta">
              <span class="episode-number">${episode.episode_number ? `Episode ${episode.episode_number}` : ''}</span>
              <span class="podcast-date">${episode.date ? new Date(episode.date).toLocaleDateString() : ''}</span>
            </div>
            <h2 class="podcast-title">${episode.title}</h2>
            ${episode.guest ? `<p class="podcast-guest">Guest: ${episode.guest}</p>` : ''}
            ${episode.description ? `<p class="podcast-description">${episode.description}</p>` : ''}
            ${links ? `<div class="podcast-links">${links}</div>` : ''}
          </div>
        </article>
      `;
    }).join('');

    podcastContainer.innerHTML = episodesHTML;
  } catch (error) {
    console.error('Error loading podcast episodes:', error);
    podcastContainer.innerHTML = '<p class="error">Error loading episodes.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadPodcastEpisodes);
