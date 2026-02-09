import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CropRecommender from "./components/CropRecommender";
import Layout from "./components/LayoutPage";
import SettingsPage from "./pages/SettingsPage";
import YieldPredictor from "./components/YieldPredictor";
import EquipmentPage from "./pages/EquipmentPage";
import CommunityPage from "./pages/CommunityPage";
import ForumPostPage from "./pages/ForumPostPage"; // 1. Import the new ForumPostPage
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* The Layout component wraps all pages to provide a consistent Navbar */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="crop-recommender" element={<CropRecommender />} />
              <Route path="yield-predictor" element={<YieldPredictor />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="equipment" element={<EquipmentPage />} />
              
              {/* 2. Add routes for the community hub and individual posts */}
              <Route path="community" element={<CommunityPage />} />
              <Route path="community/:postId" element={<ForumPostPage />} />

              {/* This is the catch-all route for pages that don't exist */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

