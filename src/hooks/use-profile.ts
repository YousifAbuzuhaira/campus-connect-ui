import { useAuth } from "@/contexts/AuthContext";
import { UpdateUser, User } from "@/lib/types";
import { useState, useEffect } from "react";

export const useProfile = () => {
  const { token, updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await fetch("http://localhost:8000/api/users/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || errorData.message || "Failed to fetch profile"
          );
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Profile fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const updateProfile = async (updates: UpdateUser): Promise<User | null> => {
    if (!user || !token) {
      setError("User not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || errorData.message || "Failed to update profile"
        );
      }

      // Refetch user data after update
      const profileResponse = await fetch(
        "http://localhost:8000/api/users/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (profileResponse.ok) {
        const updatedUser = await profileResponse.json();
        setUser(updatedUser);
        // Update the auth context so navbar and other components reflect the change
        updateUser(updatedUser);
        return updatedUser;
      }

      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    updateProfile,
  };
};
