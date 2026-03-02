import { useTranslation } from 'react-i18next'
import BottomSheet from './BottomSheet'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger = false,
}: Props) {
  const { t } = useTranslation()
  return (
    <BottomSheet title={title} onClose={onCancel}>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onConfirm}
          className={`w-full py-4 rounded-xl text-white font-medium transition-colors ${
            danger
              ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
              : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
          }`}
        >
          {confirmLabel ?? t('common.confirm')}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 text-gray-900 dark:text-white font-medium transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </BottomSheet>
  )
}
