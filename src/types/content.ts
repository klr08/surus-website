// Content types for Surus CMS
export type ContentId = string & { readonly __brand: 'ContentId' };

export interface BlogPost {
  id: ContentId;
  title: string;
  slug: string;
  author: string;
  summary: string;
  content: string;
  image?: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishDate: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}

export interface PodcastEpisode {
  id: ContentId;
  episodeNumber: number;
  title: string;
  slug: string;
  description: string;
  guest?: string;
  guestTitle?: string;
  duration?: string;
  image?: string;
  audioUrl?: string; // Libsyn URL
  spotifyUrl?: string;
  appleUrl?: string;
  amazonUrl?: string;
  youtubeUrl?: string;
  transcript?: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishDate: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: ContentId;
  name: string;
  title: string;
  bio: string;
  image?: string;
  order: number;
  linkedinUrl?: string;
  twitterUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  id: ContentId;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export type ContentType = 'blog' | 'podcast' | 'team';

export interface ContentSummary {
  blogPosts: number;
  podcastEpisodes: number;
  teamMembers: number;
  mediaFiles: number;
}
