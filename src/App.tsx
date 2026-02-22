import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductFormPage from './pages/ProductFormPage'
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
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="food" element={<ProductListPage />} />
            <Route path="food/new" element={<ProductFormPage />} />
            <Route path="food/:id" element={<ProductDetailPage />} />
            <Route path="food/:id/edit" element={<ProductFormPage />} />
            <Route path="water" element={<WaterPage />} />
            <Route path="water/edit" element={<WaterEditPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
