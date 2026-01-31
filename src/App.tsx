import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import AccountSettings from "./pages/AccountSettings";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/AdminDashboard";
import SellerGuide from "./pages/SellerGuide";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SafetyTips from "./pages/SafetyTips";
import NotFound from "./pages/NotFound";
import React from "react";

const queryClient = new QueryClient();

// Define route configuration directly within App.tsx for better organization
const appRoutes = [
  { path: "/", component: <Landing />, protected: false, publicOnly: false },
  { path: "/auth", component: <Auth />, protected: false, publicOnly: true },
  { path: "/browse", component: <Browse />, protected: true, publicOnly: false },
  { path: "/listing/:id", component: <ListingDetail />, protected: true, publicOnly: false },
  { path: "/create", component: <CreateListing />, protected: true, publicOnly: false },
  { path: "/profile", component: <Profile />, protected: true, publicOnly: false },
  { path: "/account-settings", component: <AccountSettings />, protected: true, publicOnly: false },
  { path: "/user/:userId", component: <UserProfile />, protected: true, publicOnly: false },
  { path: "/messages", component: <Messages />, protected: true, publicOnly: false },
  { path: "/admin", component: <AdminDashboard />, protected: true, publicOnly: false },
  { path: "/admin/user/:userId", component: <UserProfile />, protected: true, publicOnly: false },
  { path: "/seller-guide", component: <SellerGuide />, protected: false, publicOnly: false },
  { path: "/about", component: <About />, protected: false, publicOnly: false },
  { path: "/contact", component: <Contact />, protected: false, publicOnly: false },
  { path: "/safety", component: <SafetyTips />, protected: false, publicOnly: false },
  { path: "*", component: <NotFound />, protected: false, publicOnly: false }, // Catch-all route
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {appRoutes.map((route, index) => {
              let element = route.component;
              if (route.protected) {
                element = <ProtectedRoute>{route.component}</ProtectedRoute>;
              } else if (route.publicOnly) {
                element = <PublicRoute>{route.component}</PublicRoute>;
              }
              return <Route key={index} path={route.path} element={element} />;
            })}
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
