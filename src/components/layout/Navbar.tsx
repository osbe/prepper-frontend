import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setLanguage } from '../../i18n'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
      ? 'bg-green-700 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-md text-base font-medium transition-colors ${isActive
      ? 'bg-green-700 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-5xl mx-auto px-4">
        {/* Desktop / mobile top bar */}
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

          {/* Language switcher + hamburger */}
          <div className="ml-auto flex items-center gap-1">
            <div className="flex items-center gap-1 text-sm font-medium">
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

            {/* Hamburger button — mobile only */}
            <button
              className="sm:hidden ml-2 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden pb-3 space-y-1" onClick={() => setMenuOpen(false)}>
            <NavLink to="/food" className={mobileLinkClass}>
              🥫 {t('nav.products')}
            </NavLink>
            <NavLink to="/water" className={mobileLinkClass}>
              💧 {t('nav.water')}
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}
