// Enhanced Content Manager that uses IndexedDB for storage
import { v4 as uuidv4 } from 'uuid';
import { Result, Ok, Err } from '../types/common';
import { BlogPost, PodcastEpisode, TeamMember, ContentId } from '../types/content';
import { IndexedDBStorage } from './indexedDBStorage';

// This class maintains the same API as ContentManager but uses IndexedDB under the hood
export class EnhancedContentManager {
  private static readonly BLOG_STORAGE_KEY = 'surus_cms_blog_posts';
  private static readonly PODCAST_STORAGE_KEY = 'surus_cms_podcast_episodes';
  private static readonly TEAM_STORAGE_KEY = 'surus_cms_team_members';
  private static initialized = false;

  // Initialize IndexedDB and migrate data from localStorage if needed
  static async initialize(): Promise<Result<boolean, string>> {
    if (this.initialized) {
      return Ok(true);
    }

    try {
      // Initialize IndexedDB
      const initResult = await IndexedDBStorage.initDB();
      if (!initResult.success) {
        return Err(`Failed to initialize IndexedDB: ${initResult.error}`);
      }

      // Check if we need to migrate data from localStorage
      const migrationResult = await this.migrateIfNeeded();
      if (!migrationResult.success) {
        return Err(`Migration failed: ${migrationResult.error}`);
      }

      this.initialized = true;
      return Ok(true);
    } catch (error) {
      return Err(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if migration is needed and perform it
  private static async migrateIfNeeded(): Promise<Result<boolean, string>> {
    try {
      // Check if we have data in localStorage but not in IndexedDB
      const hasLocalStorageData = this.hasLocalStorageData();
      
      if (hasLocalStorageData) {
        console.log('Migrating data from localStorage to IndexedDB...');
        const migrationResult = await IndexedDBStorage.migrateFromLocalStorage();
        if (!migrationResult.success) {
          return Err(`Migration failed: ${migrationResult.error}`);
        }
        
        // After successful migration, we can optionally clear localStorage
        // localStorage.removeItem(this.BLOG_STORAGE_KEY);
        // localStorage.removeItem(this.PODCAST_STORAGE_KEY);
        // localStorage.removeItem(this.TEAM_STORAGE_KEY);
        
        console.log('Migration completed successfully');
      }
      
      return Ok(true);
    } catch (error) {
      return Err(`Migration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if we have data in localStorage
  private static hasLocalStorageData(): boolean {
    return !!(
      localStorage.getItem(this.BLOG_STORAGE_KEY) ||
      localStorage.getItem(this.PODCAST_STORAGE_KEY) ||
      localStorage.getItem(this.TEAM_STORAGE_KEY)
    );
  }

  // Blog Post Management - Maintains same API as ContentManager
  static async getBlogPosts(): Promise<BlogPost[]> {
    await this.initialize();
    const result = await IndexedDBStorage.getBlogPosts();
    return result.success ? result.data : [];
  }

  static async getBlogPost(id: string): Promise<BlogPost | null> {
    await this.initialize();
    const result = await IndexedDBStorage.getBlogPost(id);
    return result.success ? result.data : null;
  }

  static async saveBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<BlogPost, string>> {
    await this.initialize();
    return IndexedDBStorage.saveBlogPost(post);
  }

  static async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<Result<BlogPost, string>> {
    await this.initialize();
    return IndexedDBStorage.updateBlogPost(id, updates);
  }

  static async deleteBlogPost(id: string): Promise<Result<boolean, string>> {
    await this.initialize();
    return IndexedDBStorage.deleteBlogPost(id);
  }

  // Podcast Episode Management - Maintains same API as ContentManager
  static async getPodcastEpisodes(): Promise<PodcastEpisode[]> {
    await this.initialize();
    const result = await IndexedDBStorage.getPodcastEpisodes();
    return result.success ? result.data : [];
  }

  static async getPodcastEpisode(id: string): Promise<PodcastEpisode | null> {
    await this.initialize();
    const result = await IndexedDBStorage.getPodcastEpisode(id);
    return result.success ? result.data : null;
  }

  static async savePodcastEpisode(episode: Omit<PodcastEpisode, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<PodcastEpisode, string>> {
    await this.initialize();
    return IndexedDBStorage.savePodcastEpisode(episode);
  }

  static async updatePodcastEpisode(id: string, updates: Partial<PodcastEpisode>): Promise<Result<PodcastEpisode, string>> {
    await this.initialize();
    return IndexedDBStorage.updatePodcastEpisode(id, updates);
  }

  static async deletePodcastEpisode(id: string): Promise<Result<boolean, string>> {
    await this.initialize();
    return IndexedDBStorage.deletePodcastEpisode(id);
  }

  // Team Member Management - Maintains same API as ContentManager
  static async getTeamMembers(): Promise<TeamMember[]> {
    await this.initialize();
    const result = await IndexedDBStorage.getTeamMembers();
    return result.success ? result.data : [];
  }

  static async getTeamMember(id: string): Promise<TeamMember | null> {
    await this.initialize();
    const result = await IndexedDBStorage.getTeamMember(id);
    return result.success ? result.data : null;
  }

  static async saveTeamMember(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<TeamMember, string>> {
    await this.initialize();
    return IndexedDBStorage.saveTeamMember(member);
  }

  static async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<Result<TeamMember, string>> {
    await this.initialize();
    return IndexedDBStorage.updateTeamMember(id, updates);
  }

  static async deleteTeamMember(id: string): Promise<Result<boolean, string>> {
    await this.initialize();
    return IndexedDBStorage.deleteTeamMember(id);
  }

  // Clear all CMS data
  static async clearAllData(): Promise<Result<boolean, string>> {
    await this.initialize();
    return IndexedDBStorage.clearAllData();
  }

  // Export functionality for integration with main website
  static async exportToJSON(): Promise<{
    blogPosts: BlogPost[];
    podcastEpisodes: PodcastEpisode[];
    teamMembers: TeamMember[];
  }> {
    await this.initialize();
    const result = await IndexedDBStorage.exportToJSON();
    return result.success ? result.data : { blogPosts: [], podcastEpisodes: [], teamMembers: [] };
  }
}
