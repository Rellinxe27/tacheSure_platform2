// hooks/useTasks.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskStatus = Database['public']['Enums']['task_status'];

export const useTasks = (filters?: {
  status?: TaskStatus;
  clientId?: string;
  providerId?: string;
  limit?: number;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let query = supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.clientId) {
          query = query.eq('client_id', filters.clientId);
        }
        if (filters?.providerId) {
          query = query.eq('provider_id', filters.providerId);
        }
        if (filters?.limit) {
          query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message);
        } else {
          setTasks(data || []);
        }
      } catch (err) {
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [filters]);

  const createTask = async (taskData: Database['public']['Tables']['tasks']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setTasks(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      return { error: 'Failed to create task' };
    }
  };

  const updateTask = async (taskId: string, updates: Database['public']['Tables']['tasks']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setTasks(prev => prev.map(task => task.id === taskId ? data : task));
      return { data };
    } catch (err) {
      return { error: 'Failed to update task' };
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    refetch: () => {
      setLoading(true);
      // Re-trigger useEffect
    }
  };
};