import { useTranslation } from 'react-i18next'
import { useSync } from '../../context/useSync'

export default function SyncStatusBadge() {
  const { t } = useTranslation()
  const { status, pendingCount, prefetching, sync } = useSync()

  if (prefetching || status === 'syncing') {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-300 dark:border-blue-700/50">
        <svg className="w-3.5 h-3.5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="hidden sm:inline">{prefetching ? t('sync.loading') : t('sync.syncing')}</span>
      </div>
    )
  }

  if (status === 'idle') return null

  if (status === 'synced') {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-medium rounded-full border border-green-300 dark:border-green-700/50">
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="hidden sm:inline">{t('sync.synced')}</span>
      </div>
    )
  }

  // pending — tappable to manually trigger sync
  return (
    <button
      onClick={() => void sync()}
      className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full border border-amber-300 dark:border-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
    >
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
      <span className="hidden sm:inline">{t('sync.pending', { count: pendingCount })}</span>
      <span className="sm:hidden">{pendingCount}</span>
    </button>
  )
}
