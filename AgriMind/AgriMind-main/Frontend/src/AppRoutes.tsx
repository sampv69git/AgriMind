// Frontend/src/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import NavBar from './components/NavBar';

// Lazy load large routes/components
const Index = lazy(() => import('./pages/Index'));
const CropRecommender = lazy(() => import('./components/CropRecommender'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AppRoutes = () => {
  return (
    <>
      <NavBar />
      <main className="pt-16 min-h-screen">
        <Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/crop-recommender" element={<CropRecommender />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
};

export default AppRoutes;
