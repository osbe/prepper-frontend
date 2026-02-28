import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function HomeIcon() {
  return (
    <svg aria-hidden="true" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function FoodIcon() {
  return (
    <svg aria-hidden="true" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function WaterIcon() {
  return (
    <svg aria-hidden="true" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z" />
    </svg>
  )
}

export default function BottomTabBar() {
  const { t } = useTranslation()

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs font-medium transition-colors ${
      isActive ? 'text-green-400' : 'text-gray-400 active:text-gray-200'
    }`

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
