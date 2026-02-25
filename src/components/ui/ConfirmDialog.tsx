import { useTranslation } from 'react-i18next'
import Modal from './Modal'

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
    <Modal title={title} onClose={onCancel}>
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={onConfirm}
          className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg text-white text-sm font-medium transition-colors ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {confirmLabel ?? t('common.confirm')}
        </button>
      </div>
    </Modal>
  )
}
