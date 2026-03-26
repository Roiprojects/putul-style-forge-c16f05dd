import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/contexts/StoreContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import MobileBottomNav from "@/components/MobileBottomNav";
import CustomCursor from "@/components/CustomCursor";
import ScrollToTop from "@/components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OrdersPage from "./pages/OrdersPage";
import NotFound from "./pages/NotFound";

// Admin
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminProductForm from "@/pages/admin/AdminProductForm";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminShipping from "@/pages/admin/AdminShipping";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminHomepage from "@/pages/admin/AdminHomepage";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminCMS from "@/pages/admin/AdminCMS";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminRoles from "@/pages/admin/AdminRoles";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminLogin from "@/pages/admin/AdminLogin";

const queryClient = new QueryClient();

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const InactivityTimer = () => {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.auth.signOut();
          toast("Session expired due to inactivity. Please sign in again.");
        }
      }, INACTIVITY_TIMEOUT);
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StoreProvider>
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <InactivityTimer />
          <Routes>
            {/* Admin login - hidden route */}
            <Route path="/store-portal-access" element={<AdminLogin />} />

            {/* Admin routes - no Navbar/Footer */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="homepage" element={<AdminHomepage />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="cms" element={<AdminCMS />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="shipping" element={<AdminShipping />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Store routes */}
            <Route
              path="*"
              element={
                <>
                  <CustomCursor />
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Footer />
                  <MobileBottomNav />
                  <FloatingButtons />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
