import React from "react";
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

export const appRoutes = [
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
