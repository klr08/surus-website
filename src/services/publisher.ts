// Publisher service for one-click publishing to live site
import { ContentManager } from './contentManager';
import { FallbackContentManager } from './fallbackContentManager';
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
    const posts = FallbackContentManager.getBlogPosts();
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
    const episodes = FallbackContentManager.getPodcastEpisodes();
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
    const members = FallbackContentManager.getTeamMembers();
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

      // Save team data for backup before potentially clearing it
      const teamData = this.generateTeamJSON();
      const blogData = this.generateBlogJSON();
      const podcastData = this.generatePodcastJSON();
      const mediaData = this.generateMediaJSON();
      
      // Prepare file updates
      const files = [
        {
          path: 'public/data/blog.json',
          content: JSON.stringify(blogData, null, 2)
        },
        {
          path: 'public/data/podcast.json',
          content: JSON.stringify(podcastData, null, 2)
        },
        {
          path: 'public/data/team.json',
          content: JSON.stringify(teamData, null, 2)
        },
        {
          path: 'public/data/media.json',
          content: JSON.stringify(mediaData, null, 2)
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
  
  // Generate media.json from uploaded files
  static generateMediaJSON(): any[] {
    const mediaFiles = FileUploadService.getFiles();
    return mediaFiles.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      uploadedAt: file.uploadedAt,
      path: `images/uploads/${file.filename}`
    }));
  }

  // Publish media files to GitHub
  static async publishMedia(): Promise<PublishResult> {
    try {
      const publisher = GitHubConfigManager.getPublisher();
      const mediaFiles = FileUploadService.getFiles();
      
      if (!publisher) {
        return {
          success: false,
          message: 'GitHub not configured. Please configure GitHub access first.'
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

      // First, publish the media index
      const mediaIndexFile = {
        path: 'public/data/media.json',
        content: JSON.stringify(this.generateMediaJSON(), null, 2)
      };

      const indexResult = await publisher.publishFiles([mediaIndexFile]);
      
      if (!indexResult.success) {
        return {
          success: false,
          message: `Failed to publish media index: ${indexResult.error}`
        };
      }

      // Then publish each media file
      const uploadedFiles = [];
      let failedFiles = 0;

      for (const file of mediaFiles) {
        try {
          // For base64 data URLs, extract just the base64 part
          let fileContent = file.url;
          let encoding = 'utf8';
          
          // If it's a data URL, extract the base64 content
          if (fileContent.startsWith('data:')) {
            // Extract the base64 part (after the comma)
            fileContent = fileContent.split(',')[1];
            encoding = 'base64';
          }
          
          const fileResult = await publisher.publishFile({
            path: `public/images/uploads/${file.filename}`,
            content: fileContent,
            encoding
          });

          if (fileResult.success) {
            uploadedFiles.push(file.filename);
          } else {
            failedFiles++;
          }
        } catch (error) {
          failedFiles++;
        }
      }

      if (failedFiles === 0) {
        return {
          success: true,
          message: `Successfully published ${uploadedFiles.length} media files to GitHub.`,
          files: uploadedFiles
        };
      } else {
        return {
          success: true,
          message: `Published ${uploadedFiles.length} files, but ${failedFiles} files failed.`,
          files: uploadedFiles
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Media publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get publishing stats
  static getPublishStats(): { published: number; draft: number; total: number } {
    const blogs = FallbackContentManager.getBlogPosts();
    const podcasts = FallbackContentManager.getPodcastEpisodes();
    const team = FallbackContentManager.getTeamMembers();
    const media = FileUploadService.getFiles();
    
    const publishedBlogs = blogs.filter(b => b.published).length;
    const publishedPodcasts = podcasts.filter(p => p.published).length;
    const activeTeam = team.filter(t => t.active).length;
    
    const draftBlogs = blogs.length - publishedBlogs;
    const draftPodcasts = podcasts.length - publishedPodcasts;
    const inactiveTeam = team.length - activeTeam;
    
    return {
      published: publishedBlogs + publishedPodcasts + activeTeam + media.length,
      draft: draftBlogs + draftPodcasts + inactiveTeam,
      total: blogs.length + podcasts.length + team.length + media.length
    };
  }
}