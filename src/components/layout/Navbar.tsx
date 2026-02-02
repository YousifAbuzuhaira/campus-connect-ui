import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingBag,
  Bell,
  User,
  LogOut,
  UserCircle,
  DollarSign,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessagesCount } from "@/hooks/use-chat";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const unreadCount = useUnreadMessagesCount();

  // The isOnBrowsePage check is no longer needed for conditionally rendering the search bar.
  // The search bar will now always be visible, allowing users to search from any page.
  // const isOnBrowsePage = location.pathname === "/browse";

  const handleLogout = async () => {
    await logout();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to the browse page with the search query.
      // This allows users to initiate a search from any page and land on the browse page with the results.
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear the search input after submission
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">UniSell</span>
        </Link>

        {/* The search bar is now always visible in the Navbar.
            This enhances the global search capability, allowing users to search for products
            from any page and be directed to the browse page with their search results. */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 items-center justify-center px-8"
        >
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {user && !user.is_admin && (
            <Link to="/create">
              <Button variant="ghost" size="sm">
                Sell Item
              </Button>
            </Link>
          )}
          {user && !user.is_admin && (
            <Link to="/browse">
              <Button variant="ghost" size="sm">
                Browse
              </Button>
            </Link>
          )}
          {user && !user.is_admin && (
            <Link to="/messages">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          )}
          {/* {user && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
            </Button>
          )} */}
          {user ? (
            <div className="flex items-center gap-2">
              {!user.is_admin && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-950 rounded-full border border-green-200 dark:border-green-800">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    ${user.balance?.toFixed(2) || "0.00"}
                  </span>
                </div>
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.full_name}
                {user.is_admin && (
                  <span className="text-blue-600 font-medium"> (Admin)</span>
                )}
              </span>
              {user.is_admin ? (
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Admin Dashboard"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};