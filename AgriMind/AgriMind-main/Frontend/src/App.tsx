import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/LayoutPage";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const CropRecommender = lazy(() => import("./components/CropRecommender"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const YieldPredictor = lazy(() => import("./components/YieldPredictor"));
const EquipmentPage = lazy(() => import("./pages/EquipmentPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const ForumPostPage = lazy(() => import("./pages/ForumPostPage"));

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/auth/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}><Index /></Suspense>} />
        <Route path="crop-recommender" element={<Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}><CropRecommender /></Suspense>} />
        <Route path="yield-predictor" element={<Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}><YieldPredictor /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}><SettingsPage /></Suspense>} />
        <Route path="equipment" element={<Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}><EquipmentPage /></Suspense>} />
        <Route path="community" element={<Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}><CommunityPage /></Suspense>} />
        <Route path="community/:postId" element={<Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}><ForumPostPage /></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth/login"} replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

