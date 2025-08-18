// IndexedDB storage service for Surus CMS
import { Result, Ok, Err } from '../types/common';
import { BlogPost, PodcastEpisode, TeamMember, ContentId } from '../types/content';

// Define database structure
const DB_NAME = 'surus_cms_db';
const DB_VERSION = 1;
const STORES = {
  BLOG_POSTS: 'blog_posts',
  PODCAST_EPISODES: 'podcast_episodes',
  TEAM_MEMBERS: 'team_members',
};

export class IndexedDBStorage {
  private static db: IDBDatabase | null = null;

  // Initialize the database
  static async initDB(): Promise<Result<boolean, string>> {
    try {
      return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains(STORES.BLOG_POSTS)) {
            db.createObjectStore(STORES.BLOG_POSTS, { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains(STORES.PODCAST_EPISODES)) {
            db.createObjectStore(STORES.PODCAST_EPISODES, { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains(STORES.TEAM_MEMBERS)) {
            db.createObjectStore(STORES.TEAM_MEMBERS, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve(Ok(true));
        };

        request.onerror = (event) => {
          const error = (event.target as IDBOpenDBRequest).error;
          resolve(Err(`Failed to open database: ${error?.message || 'Unknown error'}`));
        };
      });
    } catch (error) {
      return Err(`Error initializing database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get database connection
  private static async getDB(): Promise<Result<IDBDatabase, string>> {
    if (this.db) {
      return Ok(this.db);
    }
    
    const result = await this.initDB();
    if (!result.success) {
      return Err(result.error);
    }
    
    if (!this.db) {
      return Err('Database connection failed');
    }
    
    return Ok(this.db);
  }

  // Generic method to get all items from a store
  private static async getAllItems<T>(storeName: string): Promise<Result<T[], string>> {
    try {
      const dbResult = await this.getDB();
      if (!dbResult.success) {
        return Err(dbResult.error);
      }
      
      const db = dbResult.data;
      
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(Ok(request.result as T[]));
        };
        
        request.onerror = () => {
          resolve(Err(`Failed to get items from ${storeName}: ${request.error?.message || 'Unknown error'}`));
        };
      });
    } catch (error) {
      return Err(`Error getting items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generic method to get a single item by ID
  private static async getItemById<T>(storeName: string, id: string): Promise<Result<T | null, string>> {
    try {
      const dbResult = await this.getDB();
      if (!dbResult.success) {
        return Err(dbResult.error);
      }
      
      const db = dbResult.data;
      
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(Ok(request.result as T || null));
        };
        
        request.onerror = () => {
          resolve(Err(`Failed to get item from ${storeName}: ${request.error?.message || 'Unknown error'}`));
        };
      });
    } catch (error) {
      return Err(`Error getting item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generic method to add an item
  private static async addItem<T extends { id: string }>(storeName: string, item: T): Promise<Result<T, string>> {
    try {
      const dbResult = await this.getDB();
      if (!dbResult.success) {
        return Err(dbResult.error);
      }
      
      const db = dbResult.data;
      
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);
        
        request.onsuccess = () => {
          resolve(Ok(item));
        };
        
        request.onerror = () => {
          resolve(Err(`Failed to add item to ${storeName}: ${request.error?.message || 'Unknown error'}`));
        };
      });
    } catch (error) {
      return Err(`Error adding item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generic method to update an item
  private static async updateItem<T extends { id: string }>(storeName: string, id: string, updates: Partial<T>): Promise<Result<T, string>> {
    try {
      const dbResult = await this.getDB();
      if (!dbResult.success) {
        return Err(dbResult.error);
      }
      
      const db = dbResult.data;
      
      // First get the current item
      const itemResult = await this.getItemById<T>(storeName, id);
      if (!itemResult.success) {
        return Err(itemResult.error);
      }
      
      const currentItem = itemResult.data;
      if (!currentItem) {
        return Err(`Item with ID ${id} not found in ${storeName}`);
      }
      
      // Merge updates with current item
      const updatedItem = {
        ...currentItem,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(updatedItem);
        
        request.onsuccess = () => {
          resolve(Ok(updatedItem as T));
        };
        
        request.onerror = () => {
          resolve(Err(`Failed to update item in ${storeName}: ${request.error?.message || 'Unknown error'}`));
        };
      });
    } catch (error) {
      return Err(`Error updating item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generic method to delete an item
  private static async deleteItem(storeName: string, id: string): Promise<Result<boolean, string>> {
    try {
      const dbResult = await this.getDB();
      if (!dbResult.success) {
        return Err(dbResult.error);
      }
      
      const db = dbResult.data;
      
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve(Ok(true));
        };
        
        request.onerror = () => {
          resolve(Err(`Failed to delete item from ${storeName}: ${request.error?.message || 'Unknown error'}`));
        };
      });
    } catch (error) {
      return Err(`Error deleting item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Clear a store
  private static async clearStore(storeName: string): Promise<Result<boolean, string>> {
    try {
      const dbResult = await this.getDB();
      if (!dbResult.success) {
        return Err(dbResult.error);
      }
      
      const db = dbResult.data;
      
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve(Ok(true));
        };
        
        request.onerror = () => {
          resolve(Err(`Failed to clear ${storeName}: ${request.error?.message || 'Unknown error'}`));
        };
      });
    } catch (error) {
      return Err(`Error clearing store: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Blog Post Methods
  static async getBlogPosts(): Promise<Result<BlogPost[], string>> {
    return this.getAllItems<BlogPost>(STORES.BLOG_POSTS);
  }
  
  static async getBlogPost(id: string): Promise<Result<BlogPost | null, string>> {
    return this.getItemById<BlogPost>(STORES.BLOG_POSTS, id);
  }
  
  static async saveBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<BlogPost, string>> {
    const now = new Date().toISOString();
    const newPost: BlogPost = {
      ...post,
      id: crypto.randomUUID() as ContentId,
      createdAt: now,
      updatedAt: now,
    };
    
    return this.addItem<BlogPost>(STORES.BLOG_POSTS, newPost);
  }
  
  static async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<Result<BlogPost, string>> {
    return this.updateItem<BlogPost>(STORES.BLOG_POSTS, id, updates);
  }
  
  static async deleteBlogPost(id: string): Promise<Result<boolean, string>> {
    return this.deleteItem(STORES.BLOG_POSTS, id);
  }

  // Podcast Episode Methods
  static async getPodcastEpisodes(): Promise<Result<PodcastEpisode[], string>> {
    return this.getAllItems<PodcastEpisode>(STORES.PODCAST_EPISODES);
  }
  
  static async getPodcastEpisode(id: string): Promise<Result<PodcastEpisode | null, string>> {
    return this.getItemById<PodcastEpisode>(STORES.PODCAST_EPISODES, id);
  }
  
  static async savePodcastEpisode(episode: Omit<PodcastEpisode, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<PodcastEpisode, string>> {
    const now = new Date().toISOString();
    const newEpisode: PodcastEpisode = {
      ...episode,
      id: crypto.randomUUID() as ContentId,
      createdAt: now,
      updatedAt: now,
    };
    
    return this.addItem<PodcastEpisode>(STORES.PODCAST_EPISODES, newEpisode);
  }
  
  static async updatePodcastEpisode(id: string, updates: Partial<PodcastEpisode>): Promise<Result<PodcastEpisode, string>> {
    return this.updateItem<PodcastEpisode>(STORES.PODCAST_EPISODES, id, updates);
  }
  
  static async deletePodcastEpisode(id: string): Promise<Result<boolean, string>> {
    return this.deleteItem(STORES.PODCAST_EPISODES, id);
  }

  // Team Member Methods
  static async getTeamMembers(): Promise<Result<TeamMember[], string>> {
    return this.getAllItems<TeamMember>(STORES.TEAM_MEMBERS);
  }
  
  static async getTeamMember(id: string): Promise<Result<TeamMember | null, string>> {
    return this.getItemById<TeamMember>(STORES.TEAM_MEMBERS, id);
  }
  
  static async saveTeamMember(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<TeamMember, string>> {
    const now = new Date().toISOString();
    const newMember: TeamMember = {
      ...member,
      id: crypto.randomUUID() as ContentId,
      createdAt: now,
      updatedAt: now,
    };
    
    return this.addItem<TeamMember>(STORES.TEAM_MEMBERS, newMember);
  }
  
  static async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<Result<TeamMember, string>> {
    return this.updateItem<TeamMember>(STORES.TEAM_MEMBERS, id, updates);
  }
  
  static async deleteTeamMember(id: string): Promise<Result<boolean, string>> {
    return this.deleteItem(STORES.TEAM_MEMBERS, id);
  }

  // Migration from localStorage
  static async migrateFromLocalStorage(): Promise<Result<boolean, string>> {
    try {
      // Migrate blog posts
      const blogKey = 'surus_cms_blog_posts';
      const blogData = localStorage.getItem(blogKey);
      if (blogData) {
        const blogPosts = JSON.parse(blogData) as BlogPost[];
        const clearResult = await this.clearStore(STORES.BLOG_POSTS);
        if (!clearResult.success) {
          return Err(`Failed to clear blog posts store: ${clearResult.error}`);
        }
        
        for (const post of blogPosts) {
          await this.addItem(STORES.BLOG_POSTS, post);
        }
      }
      
      // Migrate podcast episodes
      const podcastKey = 'surus_cms_podcast_episodes';
      const podcastData = localStorage.getItem(podcastKey);
      if (podcastData) {
        const episodes = JSON.parse(podcastData) as PodcastEpisode[];
        const clearResult = await this.clearStore(STORES.PODCAST_EPISODES);
        if (!clearResult.success) {
          return Err(`Failed to clear podcast episodes store: ${clearResult.error}`);
        }
        
        for (const episode of episodes) {
          await this.addItem(STORES.PODCAST_EPISODES, episode);
        }
      }
      
      // Migrate team members
      const teamKey = 'surus_cms_team_members';
      const teamData = localStorage.getItem(teamKey);
      if (teamData) {
        const members = JSON.parse(teamData) as TeamMember[];
        const clearResult = await this.clearStore(STORES.TEAM_MEMBERS);
        if (!clearResult.success) {
          return Err(`Failed to clear team members store: ${clearResult.error}`);
        }
        
        for (const member of members) {
          await this.addItem(STORES.TEAM_MEMBERS, member);
        }
      }
      
      return Ok(true);
    } catch (error) {
      return Err(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Clear all data
  static async clearAllData(): Promise<Result<boolean, string>> {
    try {
      const stores = [STORES.BLOG_POSTS, STORES.PODCAST_EPISODES, STORES.TEAM_MEMBERS];
      for (const store of stores) {
        const result = await this.clearStore(store);
        if (!result.success) {
          return Err(`Failed to clear ${store}: ${result.error}`);
        }
      }
      
      return Ok(true);
    } catch (error) {
      return Err(`Failed to clear all data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Export functionality for integration with main website
  static async exportToJSON(): Promise<Result<{
    blogPosts: BlogPost[];
    podcastEpisodes: PodcastEpisode[];
    teamMembers: TeamMember[];
  }, string>> {
    try {
      const blogResult = await this.getBlogPosts();
      if (!blogResult.success) {
        return Err(`Failed to get blog posts: ${blogResult.error}`);
      }
      
      const podcastResult = await this.getPodcastEpisodes();
      if (!podcastResult.success) {
        return Err(`Failed to get podcast episodes: ${podcastResult.error}`);
      }
      
      const teamResult = await this.getTeamMembers();
      if (!teamResult.success) {
        return Err(`Failed to get team members: ${teamResult.error}`);
      }
      
      return Ok({
        blogPosts: blogResult.data,
        podcastEpisodes: podcastResult.data,
        teamMembers: teamResult.data,
      });
    } catch (error) {
      return Err(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
