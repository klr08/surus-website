// Publisher service for one-click publishing to live site
import { ContentManager } from './contentManager';
import { FileUploadService } from './fileUpload';
import { downloadJSON } from './backup';
import { GitHubPublisher, GitHubConfigManager } from './github';

export interface PublishResult {
  success: boolean;
  message: string;
  files?: string[];
}

export class Publisher {
  // Generate blog.json in the format expected by the live site
  static generateBlogJSON(): any[] {
    const posts = ContentManager.getBlogPosts();
    return posts
      .filter(post => post.published)
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .map(post => ({
        title: post.title,
        slug: post.slug,
        author: post.author,
        date: post.publishDate + 'T00:00:00.000Z',
        summary: post.summary,
        content: post.content,
        body: post.content, // Also include as body for compatibility
        image: post.image || undefined,
        tags: Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
        featured: post.featured,
        published: post.published,
      }));
  }

  // Generate podcast.json in the format expected by the live site
  static generatePodcastJSON(): any[] {
    const episodes = ContentManager.getPodcastEpisodes();
    return episodes
      .filter(episode => episode.published)
      .sort((a, b) => b.episodeNumber - a.episodeNumber)
      .map(episode => ({
        episodeNumber: episode.episodeNumber,
        episode_number: episode.episodeNumber, // Also include underscore version
        title: episode.title,
        slug: episode.slug,
        date: episode.publishDate + 'T00:00:00.000Z',
        description: episode.description,
        summary: episode.description, // Also include as summary
        body: episode.description, // Also include as body
        guest: episode.guest || undefined,
        guestTitle: episode.guestTitle || undefined,
        guest_title: episode.guestTitle || undefined, // Underscore version
        duration: episode.duration || undefined,
        image: episode.image || undefined,
        audioUrl: episode.audioUrl || undefined,
        libsyn_url: episode.audioUrl || undefined, // Map to libsyn_url for compatibility
        spotifyUrl: episode.spotifyUrl || undefined,
        spotify_url: episode.spotifyUrl || undefined,
        appleUrl: episode.appleUrl || undefined,
        apple_url: episode.appleUrl || undefined,
        amazonUrl: episode.amazonUrl || undefined,
        amazon_url: episode.amazonUrl || undefined,
        youtubeUrl: episode.youtubeUrl || undefined,
        youtube_url: episode.youtubeUrl || undefined,
        transcript: episode.transcript || undefined,
        tags: Array.isArray(episode.tags) ? episode.tags : (episode.tags ? episode.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
        featured: episode.featured,
        published: episode.published,
      }));
  }

  // Generate team.json from CMS data
  static generateTeamJSON(): any[] {
    const members = ContentManager.getTeamMembers();
    return members
      .filter(member => member.active)
      .sort((a, b) => a.order - b.order)
      .map(member => ({
        name: member.name,
        title: member.title,
        bio: member.bio,
        order: member.order,
        image: member.image || undefined,
        linkedinUrl: member.linkedinUrl || undefined,
        twitterUrl: member.twitterUrl || undefined,
        active: member.active,
      }));
  }

  // Download all JSON files for manual deployment
  static downloadPublishFiles(): void {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    
    // Download blog.json
    const blogData = this.generateBlogJSON();
    downloadJSON(`blog-${timestamp}.json`, blogData);
    
    // Download podcast.json
    const podcastData = this.generatePodcastJSON();
    downloadJSON(`podcast-${timestamp}.json`, podcastData);
    
    // Download team.json
    const teamData = this.generateTeamJSON();
    downloadJSON(`team-${timestamp}.json`, teamData);
  }

  // Publish directly to GitHub
  static async publishToGitHub(): Promise<PublishResult> {
    try {
      const publisher = GitHubConfigManager.getPublisher();
      
      if (!publisher) {
        // Fallback to download if not configured
        this.downloadPublishFiles();
        return {
          success: true,
          message: 'GitHub not configured. Files downloaded for manual upload to public/data/.',
          files: ['blog.json', 'podcast.json', 'team.json']
        };
      }

      // Validate access first
      const validation = await publisher.validateAccess();
      if (!validation.success) {
        return {
          success: false,
          message: `GitHub access validation failed: ${validation.error}`
        };
      }

      // Prepare file updates
      const files = [
        {
          path: 'data/blog.json',
          content: JSON.stringify(this.generateBlogJSON(), null, 2)
        },
        {
          path: 'data/podcast.json',
          content: JSON.stringify(this.generatePodcastJSON(), null, 2)
        },
        {
          path: 'data/team.json',
          content: JSON.stringify(this.generateTeamJSON(), null, 2)
        }
      ];

      // Publish to GitHub
      const result = await publisher.publishFiles(files);
      
      if (result.success) {
        return {
          success: true,
          message: `Successfully published ${result.data.length} files to GitHub. Netlify will rebuild automatically.`,
          files: result.data
        };
      } else {
        return {
          success: false,
          message: `GitHub publishing failed: ${result.error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get publishing stats
  static getPublishStats(): { published: number; draft: number; total: number } {
    const blogs = ContentManager.getBlogPosts();
    const podcasts = ContentManager.getPodcastEpisodes();
    const team = ContentManager.getTeamMembers();
    
    const publishedBlogs = blogs.filter(b => b.published).length;
    const publishedPodcasts = podcasts.filter(p => p.published).length;
    const activeTeam = team.filter(t => t.active).length;
    
    const draftBlogs = blogs.length - publishedBlogs;
    const draftPodcasts = podcasts.length - publishedPodcasts;
    const inactiveTeam = team.length - activeTeam;
    
    return {
      published: publishedBlogs + publishedPodcasts + activeTeam,
      draft: draftBlogs + draftPodcasts + inactiveTeam,
      total: blogs.length + podcasts.length + team.length
    };
  }
}
