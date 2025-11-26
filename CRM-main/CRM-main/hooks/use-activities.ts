'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Activity } from '@/types';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchActivities() {
      try {
        setLoading(true);
        const response = await apiClient.getActivities();

        if (response.success && isMounted) {
          setActivities((response.data as Activity[]) || []);
          setError(null);
        } else {
          throw new Error(response.error || 'Failed to fetch activities');
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

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  const addActivity = async (activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiClient.createActivity(activityData);

      if (response.success) {
        // Refresh activities list
        const fetchResponse = await apiClient.getActivities();
        if (fetchResponse.success) {
          setActivities((fetchResponse.data as Activity[]) || []);
        }
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to add activity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
      throw err;
    }
  };

  const updateActivity = async (id: string, activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiClient.updateActivity(id, activityData);

      if (response.success) {
        // Refresh activities list
        const fetchResponse = await apiClient.getActivities();
        if (fetchResponse.success) {
          setActivities((fetchResponse.data as Activity[]) || []);
        }
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update activity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      throw err;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const response = await apiClient.deleteActivity(id);

      if (response.success) {
        // Refresh activities list
        const fetchResponse = await apiClient.getActivities();
        if (fetchResponse.success) {
          setActivities((fetchResponse.data as Activity[]) || []);
        }
      } else {
        throw new Error(response.error || 'Failed to delete activity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
      throw err;
    }
  };

  return {
    activities,
    loading,
    error,
    addActivity,
    updateActivity,
    deleteActivity
  };
}