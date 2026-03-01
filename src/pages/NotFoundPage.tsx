import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-400 dark:text-gray-600 mb-4">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t('not_found.message')}</p>
      <Link to="/" className="text-green-600 dark:text-green-400 hover:underline">
        {t('not_found.cta')}
      </Link>
    </div>
  )
}
