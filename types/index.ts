// types/index.ts
import type { Article, Topic, Module, User, MediaAsset, Tag, ArticleStatus } from '@prisma/client'

// ─── Extended / joined types ────────────────────────────────────────────────

export type ArticleWithRelations = Article & {
  author: Pick<User, 'id' | 'name' | 'email'>
  topicArticles: Array<{
    topic: Pick<Topic, 'id' | 'title' | 'slug' | 'color' | 'moduleId'> & {
      module: Pick<Module, 'id' | 'title' | 'slug' | 'color' | 'orderIndex'>
    }
  }>
  articleTags: Array<{ tag: Pick<Tag, 'id' | 'name' | 'slug'> }>
  coverImage: Pick<MediaAsset, 'id' | 'url' | 'altText' | 'width' | 'height'> | null
}

export type TopicWithRelations = Topic & {
  module: Pick<Module, 'id' | 'title' | 'slug' | 'color' | 'orderIndex' | 'icon'>
  topicArticles: Array<{
    orderIndex: number
    article: Pick<Article, 'id' | 'title' | 'slug' | 'summary' | 'status' | 'publishedAt' | 'readingTimeMinutes' | 'viewCount'>
  }>
  _count?: { topicArticles: number }
}

export type ModuleWithRelations = Module & {
  topics: Array<TopicWithRelations>
  _count?: { topics: number }
}

// ─── API response types ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── AI request/response types ──────────────────────────────────────────────

export type AITextMode = 'generate' | 'expand' | 'summarize' | 'rewrite' | 'outline' | 'improve'
export type AITextTone = 'professional' | 'conversational' | 'technical' | 'inspirational'
export type AITextLength = 'short' | 'medium' | 'long'

export interface AITextRequest {
  prompt: string
  mode?: AITextMode
  tone?: AITextTone
  length?: AITextLength
  context?: string
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  articleId?: number
}

export interface AIImageRequest {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  model?: string
}

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

export interface AIAudioRequest {
  text: string
  voice?: TTSVoice
  speed?: number
  model?: string
  articleId?: number
}

// ─── Form types ─────────────────────────────────────────────────────────────

export interface ArticleFormData {
  title: string
  slug: string
  summary?: string
  content: string
  status: ArticleStatus
  topicIds: number[]
  tagIds?: number[]
  coverImageId?: number
  readingTimeMinutes?: number
  isFeatured?: boolean
  publishedAt?: string
  scheduledAt?: string
  seoTitle?: string
  seoDescription?: string
  seoCanonicalUrl?: string
  ogImageUrl?: string
}

export interface TopicFormData {
  title: string
  slug: string
  moduleId: number
  shortDescription?: string
  icon?: string
  color?: string
  coverImage?: string
  orderIndex?: number
  isPublished?: boolean
}

export interface ModuleFormData {
  title: string
  slug: string
  shortDescription?: string
  icon?: string
  color?: string
  coverImage?: string
  orderIndex?: number
  isPublished?: boolean
}

// ─── Admin session user ──────────────────────────────────────────────────────

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: number
  title: string
  slug: string
  summary?: string | null
  publishedAt: Date | null
  readingTimeMinutes?: number | null
  topic?: { title: string; slug: string; color?: string | null } | null
}
