import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/Header'

const Home            = lazy(() => import('@/pages/Home'))
const Catalog         = lazy(() => import('@/pages/Catalog'))
const AnimeDetail     = lazy(() => import('@/pages/AnimeDetail'))
const MyLists         = lazy(() => import('@/pages/MyLists'))
const Recommendations = lazy(() => import('@/pages/Recommendations'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/catalog"        element={<Catalog />} />
          <Route path="/anime/:id"      element={<AnimeDetail />} />
          <Route path="/my-lists"       element={<MyLists />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="*"              element={
            <div className="min-h-screen flex items-center justify-center text-center">
              <div>
                <p className="text-8xl font-black text-white/10 mb-4">404</p>
                <p className="text-white/50">Страница не найдена</p>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </div>
  )
}
