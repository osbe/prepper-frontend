import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setLanguage } from '../../i18n'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const isOnline = useOnlineStatus()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
      ? 'bg-green-700 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2 h-14">
          <NavLink to="/" className="text-white font-bold text-lg mr-4 hover:text-green-500 transition-colors">
            {t('nav.brand')}
          </NavLink>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-1">
            <NavLink to="/food" className={linkClass}>
              🥫 {t('nav.products')}
            </NavLink>
            <NavLink to="/water" className={linkClass}>
              💧 {t('nav.water')}
            </NavLink>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {!isOnline && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-900/40 text-amber-400 text-xs font-medium rounded-full border border-amber-700/50">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
                <span className="hidden sm:inline">{t('offline.indicator')}</span>
              </div>
            )}
            {/* Language switcher — desktop only */}
            <div className="hidden sm:flex items-center gap-1 text-sm font-medium">
              {(['sv', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${i18n.language === lang
                    ? 'bg-green-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {t(`lang_label.${lang}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
