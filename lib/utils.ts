// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { logger } from '@/lib/logger'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date to human-readable */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  return format(new Date(date), 'MMMM d, yyyy')
}

/** Relative time e.g. "3 days ago" */
export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/** Truncate text to N chars */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '...'
}

/** Format number with commas */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n)
}

/** Strip HTML tags */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Get initials from name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Build absolute URL */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${base}${path}`
}

/** Standard API success response */
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status })
}

/**
 * Standard API error response.
 * Optionally pass the caught `err` object so the full error (including stack
 * trace in dev / verbose mode) is written to the server logs.
 *
 * @param message – client-facing error message
 * @param status  – HTTP status code (default 400)
 * @param err     – original caught error for server-side logging (never sent to client)
 */
export function apiError(message: string, status = 400, err?: unknown) {
  if (err !== undefined) {
    logger.error(message, err)
  }
  return Response.json({ success: false, error: message }, { status })
}
