import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'
import { BackendStatusProvider } from './context/BackendStatusProvider'
import { SyncProvider } from './context/SyncProvider'
import { ThemeProvider } from './context/ThemeProvider'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import FoodListPage from './pages/FoodListPage'
import FoodDetailPage from './pages/FoodDetailPage'
import FoodFormPage from './pages/FoodFormPage'
import WaterPage from './pages/WaterPage'
import WaterEditPage from './pages/WaterEditPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <BackendStatusProvider>
        <SyncProvider>
          <BrowserRouter basename={(document.querySelector('base')?.getAttribute('href') ?? '/').replace(/\/$/, '') || '/'}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="food" element={<FoodListPage />} />
                <Route path="food/new" element={<FoodFormPage />} />
                <Route path="food/:id" element={<FoodDetailPage />} />
                <Route path="food/:id/edit" element={<FoodFormPage />} />
                <Route path="water" element={<WaterPage />} />
                <Route path="water/edit" element={<WaterEditPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SyncProvider>
      </BackendStatusProvider>
    </QueryClientProvider>
    </ThemeProvider>
  )
}
