import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setLanguage } from '../../i18n'
import { useProducts } from '../../hooks/useProducts'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { data: products = [] } = useProducts()

  const waterProduct = products.find((p) => p.category === 'WATER')

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
      ? 'bg-green-700 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-2 h-14">
        <NavLink to="/" className="text-white font-bold text-lg mr-4 hover:text-green-500 transition-colors">
          {t('nav.brand')}
        </NavLink>
        <NavLink to="/food" className={linkClass}>
          🥫 {t('nav.products')}
        </NavLink>
        {waterProduct && (
          <NavLink to="/water" className={linkClass}>
            💧 {t('nav.water')}
          </NavLink>
        )}
        <div className="ml-auto flex items-center gap-1 text-sm font-medium">
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
    </nav>
  )
}
