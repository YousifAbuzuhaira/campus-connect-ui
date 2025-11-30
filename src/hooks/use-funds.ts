import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AddFundsRequest, AddFundsResponse } from '@/lib/types';

export const useFunds = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshUser } = useAuth();

  const getBalance = async (): Promise<number | null> => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/users/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get balance');
      }

      const data = await response.json();
      return data.data.balance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get balance');
      return null;
    }
  };

  const addFunds = async (amount: number): Promise<AddFundsResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const requestData: AddFundsRequest = { amount };

      const response = await fetch('http://localhost:8000/api/users/add-funds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add funds');
      }

      const data = await response.json();
      
      // Refresh user data to get updated balance
      if (refreshUser) {
        await refreshUser();
      }
      
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add funds');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    balance: user?.balance ?? 0,
    isLoading,
    error,
    getBalance,
    addFunds,
  };
};