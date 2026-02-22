import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import sv from './locales/sv'
import en from './locales/en'

const STORAGE_KEY = 'prepper-lang'
const savedLang = localStorage.getItem(STORAGE_KEY)

i18n.use(initReactI18next).init({
  resources: {
    sv: { translation: sv },
    en: { translation: en },
  },
  lng: savedLang ?? 'sv',
  fallbackLng: 'sv',
  interpolation: { escapeValue: false },
})

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang)
  localStorage.setItem(STORAGE_KEY, lang)
}

function getLocale(lang: string): string {
  return lang === 'sv' ? 'sv-SE' : 'en-GB'
}

export function formatDate(dateStr: string, lang: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return new Intl.DateTimeFormat(getLocale(lang), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return dateStr
  }
}

export default i18n
