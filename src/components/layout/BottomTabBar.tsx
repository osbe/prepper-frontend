import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HomeIcon, FoodIcon, WaterIcon } from '../ui/icons'

const tabClass = ({ isActive }: { isActive: boolean }): string =>
  `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs font-medium transition-colors ${
    isActive ? 'text-green-400' : 'text-gray-400 active:text-gray-200'
  }`

export default function BottomTabBar() {
  const { t } = useTranslation()

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-gray-900 border-t border-gray-700 pb-[env(safe-area-inset-bottom)]">
      <NavLink to="/" end className={tabClass}>
        <HomeIcon />
        <span>{t('nav.dashboard')}</span>
      </NavLink>
      <NavLink to="/food" className={tabClass}>
        <FoodIcon />
        <span>{t('nav.products')}</span>
      </NavLink>
      <NavLink to="/water" className={tabClass}>
        <WaterIcon />
        <span>{t('nav.water')}</span>
      </NavLink>
    </nav>
  )
}
