// Content management service for Surus CMS
import { v4 as uuidv4 } from 'uuid';
import { Result, Ok, Err } from '../types/common';
import { BlogPost, PodcastEpisode, TeamMember, ContentId } from '../types/content';

export class ContentManager {
  private static readonly BLOG_STORAGE_KEY = 'surus_cms_blog_posts';
  private static readonly PODCAST_STORAGE_KEY = 'surus_cms_podcast_episodes';
  private static readonly TEAM_STORAGE_KEY = 'surus_cms_team_members';

  // Blog Post Management
  static getBlogPosts(): BlogPost[] {
    try {
      const stored = localStorage.getItem(this.BLOG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getBlogPost(id: string): BlogPost | null {
    const posts = this.getBlogPosts();
    return posts.find(p => p.id === id) || null;
  }

  static saveBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Result<BlogPost, string> {
    try {
      const posts = this.getBlogPosts();
      const now = new Date().toISOString();
      
      const newPost: BlogPost = {
        ...post,
        id: uuidv4() as ContentId,
        createdAt: now,
        updatedAt: now,
      };

      posts.push(newPost);
      localStorage.setItem(this.BLOG_STORAGE_KEY, JSON.stringify(posts));
      
      return Ok(newPost);
    } catch (error) {
      return Err(`Failed to save blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static updateBlogPost(id: string, updates: Partial<BlogPost>): Result<BlogPost, string> {
    try {
      const posts = this.getBlogPosts();
      const index = posts.findIndex(p => p.id === id);
      
      if (index === -1) {
        return Err('Blog post not found');
      }

      posts[index] = {
        ...posts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(this.BLOG_STORAGE_KEY, JSON.stringify(posts));
      return Ok(posts[index]);
    } catch (error) {
      return Err(`Failed to update blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static deleteBlogPost(id: string): Result<boolean, string> {
    try {
      const posts = this.getBlogPosts();
      const filtered = posts.filter(p => p.id !== id);
      localStorage.setItem(this.BLOG_STORAGE_KEY, JSON.stringify(filtered));
      return Ok(true);
    } catch (error) {
      return Err(`Failed to delete blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Podcast Episode Management
  static getPodcastEpisodes(): PodcastEpisode[] {
    try {
      const stored = localStorage.getItem(this.PODCAST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getPodcastEpisode(id: string): PodcastEpisode | null {
    const episodes = this.getPodcastEpisodes();
    return episodes.find(e => e.id === id) || null;
  }

  static savePodcastEpisode(episode: Omit<PodcastEpisode, 'id' | 'createdAt' | 'updatedAt'>): Result<PodcastEpisode, string> {
    try {
      const episodes = this.getPodcastEpisodes();
      const now = new Date().toISOString();
      
      const newEpisode: PodcastEpisode = {
        ...episode,
        id: uuidv4() as ContentId,
        createdAt: now,
        updatedAt: now,
      };

      episodes.push(newEpisode);
      
      // Try to save with quota handling
      try {
        localStorage.setItem(this.PODCAST_STORAGE_KEY, JSON.stringify(episodes));
      } catch (quotaError) {
        if (quotaError instanceof Error && quotaError.name === 'QuotaExceededError') {
          // Try to free up space by optimizing content
          const optimizedEpisodes = this.optimizePodcastData(episodes);
          localStorage.setItem(this.PODCAST_STORAGE_KEY, JSON.stringify(optimizedEpisodes));
        } else {
          throw quotaError;
        }
      }
      
      return Ok(newEpisode);
    } catch (error) {
      return Err(`Failed to save podcast episode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static updatePodcastEpisode(id: string, updates: Partial<PodcastEpisode>): Result<PodcastEpisode, string> {
    try {
      const episodes = this.getPodcastEpisodes();
      const index = episodes.findIndex(e => e.id === id);
      
      if (index === -1) {
        return Err('Podcast episode not found');
      }

      episodes[index] = {
        ...episodes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(this.PODCAST_STORAGE_KEY, JSON.stringify(episodes));
      return Ok(episodes[index]);
    } catch (error) {
      return Err(`Failed to update podcast episode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static deletePodcastEpisode(id: string): Result<boolean, string> {
    try {
      const episodes = this.getPodcastEpisodes();
      const filtered = episodes.filter(e => e.id !== id);
      localStorage.setItem(this.PODCAST_STORAGE_KEY, JSON.stringify(filtered));
      return Ok(true);
    } catch (error) {
      return Err(`Failed to delete podcast episode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Team Member Management
  static getTeamMembers(): TeamMember[] {
    try {
      const stored = localStorage.getItem(this.TEAM_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getTeamMember(id: string): TeamMember | null {
    const members = this.getTeamMembers();
    return members.find(m => m.id === id) || null;
  }

  static saveTeamMember(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Result<TeamMember, string> {
    try {
      const members = this.getTeamMembers();
      const now = new Date().toISOString();
      
      const newMember: TeamMember = {
        ...member,
        id: uuidv4() as ContentId,
        createdAt: now,
        updatedAt: now,
      };

      members.push(newMember);
      localStorage.setItem(this.TEAM_STORAGE_KEY, JSON.stringify(members));
      
      return Ok(newMember);
    } catch (error) {
      return Err(`Failed to save team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static updateTeamMember(id: string, updates: Partial<TeamMember>): Result<TeamMember, string> {
    try {
      const members = this.getTeamMembers();
      const index = members.findIndex(m => m.id === id);
      
      if (index === -1) {
        return Err('Team member not found');
      }

      members[index] = {
        ...members[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(this.TEAM_STORAGE_KEY, JSON.stringify(members));
      return Ok(members[index]);
    } catch (error) {
      return Err(`Failed to update team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static deleteTeamMember(id: string): Result<boolean, string> {
    try {
      const members = this.getTeamMembers();
      const filtered = members.filter(m => m.id !== id);
      localStorage.setItem(this.TEAM_STORAGE_KEY, JSON.stringify(filtered));
      return Ok(true);
    } catch (error) {
      return Err(`Failed to delete team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Optimize podcast data to reduce storage size
  private static optimizePodcastData(episodes: PodcastEpisode[]): PodcastEpisode[] {
    return episodes.map(episode => ({
      ...episode,
      // Truncate very long descriptions to save space
      description: episode.description && episode.description.length > 500 
        ? episode.description.substring(0, 500) + '...' 
        : episode.description,
      // Remove any very large fields that might be causing issues
      body: episode.body && episode.body.length > 2000 
        ? episode.body.substring(0, 2000) + '...' 
        : episode.body
    }));
  }

  // Check localStorage usage
  static getStorageUsage(): { used: number; total: number; available: number } {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    
    // Estimate total available (usually ~5-10MB)
    const estimated = 5 * 1024 * 1024; // 5MB estimate
    return {
      used: total,
      total: estimated,
      available: estimated - total
    };
  }

  // Export functionality for integration with main website
  static exportToJSON(): {
    blogPosts: BlogPost[];
    podcastEpisodes: PodcastEpisode[];
    teamMembers: TeamMember[];
  } {
    return {
      blogPosts: this.getBlogPosts(),
      podcastEpisodes: this.getPodcastEpisodes(),
      teamMembers: this.getTeamMembers(),
    };
  }
}
