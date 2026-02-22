import { useTranslation } from 'react-i18next'
import { formatDate } from './index'

export function useFormatDate() {
  const { i18n } = useTranslation()
  return (dateStr: string) => formatDate(dateStr, i18n.language)
}
