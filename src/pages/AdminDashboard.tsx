import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/adminApi";
import { User, Listing, AdminStats } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Package,
  Eye,
  EyeOff,
  Trash2,
  Shield,
  ShieldOff,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchUsers, setSearchUsers] = useState("");
  const [searchListings, setSearchListings] = useState("");
  const [showBannedOnly, setShowBannedOnly] = useState(false);
  const [includeHiddenListings, setIncludeHiddenListings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      window.location.href = "/";
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user?.is_admin) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, listingsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ page: 1, per_page: 50 }),
        adminApi.getListings({ page: 1, per_page: 50 }),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setListings(listingsData);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      await adminApi.banUser(userId);
      toast({
        title: "Success",
        description: "User banned successfully",
      });
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await adminApi.unbanUser(userId);
      toast({
        title: "Success",
        description: "User unbanned successfully",
      });
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to unban user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminApi.deleteUser(userId);
      toast({
        title: "Success",
        description: "User account deleted successfully",
      });
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await adminApi.deleteListing(listingId);
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search and banned status
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchUsers ||
      u.username.toLowerCase().includes(searchUsers.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchUsers.toLowerCase());

    const matchesBannedFilter = !showBannedOnly || u.is_banned;

    return matchesSearch && matchesBannedFilter && !u.is_admin; // Don't show other admins
  });

  // Filter listings based on search
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      !searchListings ||
      listing.title.toLowerCase().includes(searchListings.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchListings.toLowerCase());

    return matchesSearch;
  });

  if (!user?.is_admin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="flex items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Button>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Administrator
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.users.active} active, {stats.users.banned} banned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Listings
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.listings.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.listings.active} active, {stats.listings.sold} sold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Listings
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.listings.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.listings.hidden} hidden
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.active}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.users.active / stats.users.total) * 100).toFixed(1)}%
                of total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="listings">Listing Management</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, ban/unban users, and delete accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  placeholder="Search users by username, email, or name..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant={showBannedOnly ? "default" : "outline"}
                  onClick={() => setShowBannedOnly(!showBannedOnly)}
                >
                  {showBannedOnly ? "Show All" : "Show Banned Only"}
                </Button>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {user.full_name || user.username}
                        </h3>
                        {user.is_banned && (
                          <Badge variant="destructive">Banned</Badge>
                        )}
                        {!user.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        @{user.username} • Balance: $
                        {user.balance?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!user.is_banned ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <ShieldOff className="h-4 w-4 mr-1" />
                              Ban
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ban User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to ban {user.username}?
                                This will prevent them from accessing the
                                platform.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleBanUser(user.id)}
                              >
                                Ban User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Unban
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete User Account
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete{" "}
                              {user.username}'s account? This action cannot be
                              undone and will delete all their data including
                              listings.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listing Management</CardTitle>
              <CardDescription>
                Manage listings, view hidden items, and delete inappropriate
                content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  placeholder="Search listings by title or description..."
                  value={searchListings}
                  onChange={(e) => setSearchListings(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant={includeHiddenListings ? "default" : "outline"}
                  onClick={() =>
                    setIncludeHiddenListings(!includeHiddenListings)
                  }
                >
                  {includeHiddenListings ? (
                    <Eye className="h-4 w-4 mr-2" />
                  ) : (
                    <EyeOff className="h-4 w-4 mr-2" />
                  )}
                  {includeHiddenListings ? "Hide Hidden" : "Show Hidden"}
                </Button>
              </div>

              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{listing.title}</h3>
                        {listing.is_sold && (
                          <Badge variant="secondary">Sold</Badge>
                        )}
                        {listing.is_hidden && (
                          <Badge variant="outline">Hidden</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        ${listing.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {listing.seller_name} • {listing.category} • Stock:{" "}
                        {listing.stock}
                      </p>
                      {listing.description && (
                        <p className="text-sm text-gray-600 mt-2 truncate max-w-md">
                          {listing.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete "
                              {listing.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteListing(listing.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Listing
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>

              {filteredListings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No listings found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
