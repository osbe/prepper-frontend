import { useEffect, useRef } from 'react'

interface Props {
  message: string
  actionLabel: string
  onAction: () => void
  onDismiss: () => void
  duration?: number
}

export default function Toast({ message, actionLabel, onAction, onDismiss, duration = 5000 }: Props) {
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    const timer = setTimeout(() => dismissRef.current(), duration)
    return () => clearTimeout(timer)
  }, [duration])

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between gap-4 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-white text-sm">{message}</p>
      <button
        onClick={() => { onAction(); onDismiss() }}
        className="text-green-400 text-sm font-semibold shrink-0 hover:text-green-300 transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  )
}
