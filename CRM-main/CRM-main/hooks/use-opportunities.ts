'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Opportunity } from '@/types';

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOpportunities() {
      try {
        setLoading(true);
        const response = await apiClient.getOpportunities();

        if (response.success && isMounted) {
          setOpportunities((response.data as Opportunity[]) || []);
          setError(null);
        } else {
          throw new Error(response.error || 'Failed to fetch opportunities');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOpportunities();

    return () => {
      isMounted = false;
    };
  }, []);

  const addOpportunity = async (opportunityData: any) => {
    try {
      const response = await apiClient.createOpportunity(opportunityData);

      if (response.success) {
        // Refresh opportunities list
        const fetchResponse = await apiClient.getOpportunities();
        if (fetchResponse.success) {
          setOpportunities((fetchResponse.data as Opportunity[]) || []);
        }
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to add opportunity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add opportunity');
      throw err;
    }
  };

  const updateOpportunity = async (id: string, opportunityData: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiClient.updateOpportunity(id, opportunityData);

      if (response.success) {
        // Refresh opportunities list
        const fetchResponse = await apiClient.getOpportunities();
        if (fetchResponse.success) {
          setOpportunities((fetchResponse.data as Opportunity[]) || []);
        }
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update opportunity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update opportunity');
      throw err;
    }
  };

  const deleteOpportunity = async (id: string) => {
    try {
      const response = await apiClient.deleteOpportunity(id);

      if (response.success) {
        // Refresh opportunities list
        const fetchResponse = await apiClient.getOpportunities();
        if (fetchResponse.success) {
          setOpportunities((fetchResponse.data as Opportunity[]) || []);
        }
      } else {
        throw new Error(response.error || 'Failed to delete opportunity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete opportunity');
      throw err;
    }
  };

  return {
    opportunities,
    loading,
    error,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity
  };
}