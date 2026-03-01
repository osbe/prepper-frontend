import { useEffect, useLayoutEffect, useRef } from 'react'

interface Props {
  message: string
  actionLabel: string
  onAction: () => void
  onDismiss: () => void
  duration?: number
}

export default function Toast({ message, actionLabel, onAction, onDismiss, duration = 5000 }: Props) {
  const dismissRef = useRef(onDismiss)
  useLayoutEffect(() => {
    dismissRef.current = onDismiss
  })

  useEffect(() => {
    const timer = setTimeout(() => dismissRef.current(), duration)
    return () => clearTimeout(timer)
  }, [duration])

  return (
    <div role="status" aria-live="polite" className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between gap-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-gray-900 dark:text-white text-sm">{message}</p>
      <button
        onClick={onAction}
        className="text-green-600 dark:text-green-400 text-sm font-semibold shrink-0 hover:text-green-700 dark:hover:text-green-300 transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  )
}
