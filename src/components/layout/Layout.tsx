import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './Navbar'
import BottomTabBar from './BottomTabBar'
import { useBackendStatus } from '../../context/useBackendStatus'

export default function Layout() {
  const { t } = useTranslation()
  const isOffline = useBackendStatus()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-20 sm:pb-6">
        <Outlet />
      </main>
      <BottomTabBar />
      {isOffline && (
        <div className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 pointer-events-auto">
          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
          <p className="text-xl font-semibold text-gray-100">{t('offline.title')}</p>
          <p className="text-sm text-gray-400">{t('offline.message')}</p>
        </div>
      )}
    </div>
  )
}
