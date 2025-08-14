// GitHub API integration for automatic publishing
import { Result, Ok, Err } from '../types/common';

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

interface FileUpdate {
  path: string;
  content: string;
  sha?: string;
}

export class GitHubPublisher {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  // Get current file SHA (required for updates)
  private async getFileSHA(path: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.sha;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Update a single file
  private async updateFile(fileUpdate: FileUpdate): Promise<Result<boolean, string>> {
    try {
      // Get current SHA if file exists
      const sha = await this.getFileSHA(fileUpdate.path);
      
      const body = {
        message: `Update ${fileUpdate.path} from CMS`,
        content: btoa(unescape(encodeURIComponent(fileUpdate.content))), // UTF-8 safe Base64 encode
        branch: this.config.branch,
        ...(sha && { sha }), // Include SHA if file exists
      };

      const response = await fetch(
        `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${fileUpdate.path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        return Ok(true);
      } else {
        const error = await response.text();
        return Err(`GitHub API error: ${response.status} ${error}`);
      }
    } catch (error) {
      return Err(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Publish multiple files
  async publishFiles(files: FileUpdate[]): Promise<Result<string[], string>> {
    const results: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const result = await this.updateFile(file);
      if (result.success) {
        results.push(file.path);
      } else {
        errors.push(`${file.path}: ${result.error}`);
      }
    }

    if (errors.length > 0) {
      return Err(`Failed to update: ${errors.join(', ')}`);
    }

    return Ok(results);
  }

  // Validate token and repository access
  async validateAccess(): Promise<Result<boolean, string>> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const hasWriteAccess = data.permissions?.push || data.permissions?.admin;
        
        if (hasWriteAccess) {
          return Ok(true);
        } else {
          return Err('Token does not have write access to repository');
        }
      } else {
        return Err(`Cannot access repository: ${response.status}`);
      }
    } catch (error) {
      return Err(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// GitHub configuration management
export class GitHubConfigManager {
  private static readonly STORAGE_KEY = 'surus_github_config';

  static save(config: Partial<GitHubConfig>): void {
    const existing = this.load();
    const updated = { ...existing, ...config };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static load(): Partial<GitHubConfig> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static isConfigured(): boolean {
    const config = this.load();
    return !!(config.token && config.owner && config.repo && config.branch);
  }

  static getPublisher(): GitHubPublisher | null {
    const config = this.load();
    if (this.isConfigured()) {
      return new GitHubPublisher(config as GitHubConfig);
    }
    return null;
  }
}
