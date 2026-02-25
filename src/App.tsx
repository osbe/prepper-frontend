import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BackendStatusProvider } from './context/BackendStatusProvider'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import FoodListPage from './pages/FoodListPage'
import FoodDetailPage from './pages/FoodDetailPage'
import FoodFormPage from './pages/FoodFormPage'
import WaterPage from './pages/WaterPage'
import WaterEditPage from './pages/WaterEditPage'
import NotFoundPage from './pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BackendStatusProvider>
        <BrowserRouter>
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
      </BackendStatusProvider>
    </QueryClientProvider>
  )
}
