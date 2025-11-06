/**
 * Build information
 * This file is generated/updated during build or can be set manually
 */

export const buildInfo = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toLocaleString('th-TH', { 
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }),
  commitHash: process.env.NEXT_PUBLIC_COMMIT_HASH || 'dev',
}

export function formatBuildDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return dateString
  }
}

