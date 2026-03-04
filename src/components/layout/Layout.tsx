import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomTabBar from './BottomTabBar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-20 sm:pb-6">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
