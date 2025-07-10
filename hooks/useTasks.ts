// hooks/useTasks.ts (Enhanced with better data persistence and error handling)
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
type TaskStatus = Database['public']['Enums']['task_status'];
type TaskUrgency = Database['public']['Enums']['task_urgency'];

interface TaskFilters {
  status?: TaskStatus;
  urgency?: TaskUrgency;
  clientId?: string;
  providerId?: string;
  categoryId?: string;
  limit?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
  };
}

export const useTasks = (filters?: TaskFilters) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('tasks')
        .select(`
          *,
          categories (
            id,
            name_fr,
            icon
          ),
          client:profiles!client_id (
            id,
            full_name,
            avatar_url,
            is_verified,
            trust_score
          ),
          provider:profiles!provider_id (
            id,
            full_name,
            avatar_url,
            is_verified,
            trust_score
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.urgency) {
        query = query.eq('urgency', filters.urgency);
      }

      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      if (filters?.providerId) {
        query = query.eq('provider_id', filters.providerId);
      }

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      // Location-based filtering (simplified - would need PostGIS functions in production)
      if (filters?.location) {
        // This is a simplified approach - in production you'd use ST_DWithin
        // For now, we'll filter client-side after fetching
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching tasks:', fetchError);
        setError(fetchError.message);
      } else {
        let filteredData = data || [];

        // Client-side location filtering (temporary solution)
        if (filters?.location && filteredData.length > 0) {
          filteredData = filteredData.filter(task => {
            // This would be replaced with proper PostGIS queries
            return true; // For now, return all tasks
          });
        }

        setTasks(filteredData);
      }
    } catch (err) {
      console.error('Unexpected error fetching tasks:', err);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskInsert) => {
    try {
      // Validate required fields
      if (!taskData.client_id || !taskData.title || !taskData.description) {
        return { error: 'Données manquantes pour créer la tâche' };
      }

      if (!taskData.location || !taskData.address) {
        return { error: 'La localisation est obligatoire' };
      }

      // Validate budget if provided
      if (taskData.budget_min && taskData.budget_max && taskData.budget_min > taskData.budget_max) {
        return { error: 'Le budget minimum ne peut pas être supérieur au budget maximum' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          status: taskData.status || 'posted',
          urgency: taskData.urgency || 'normal',
          applicant_count: 0,
          views_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          categories (
            id,
            name_fr,
            icon
          ),
          client:profiles!client_id (
            id,
            full_name,
            avatar_url,
            is_verified,
            trust_score
          )
        `)
        .single();

      if (error) {
        console.error('Error creating task:', error);
        return { error: error.message };
      }

      // Update local state
      setTasks(prev => [data, ...prev]);

      // Create notification for relevant providers (would be done via database triggers in production)
      await notifyRelevantProviders(data);

      return { data };
    } catch (err) {
      console.error('Unexpected error creating task:', err);
      return { error: 'Erreur lors de la création de la tâche' };
    }
  };

  const updateTask = async (taskId: string, updates: TaskUpdate) => {
    try {
      if (!taskId) {
        return { error: 'ID de la tâche requis' };
      }

      // Validate status transitions
      if (updates.status) {
        const validTransitions = getValidStatusTransitions();
        // Add validation logic here
      }

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select(`
          *,
          categories (
            id,
            name_fr,
            icon
          ),
          client:profiles!client_id (
            id,
            full_name,
            avatar_url,
            is_verified,
            trust_score
          ),
          provider:profiles!provider_id (
            id,
            full_name,
            avatar_url,
            is_verified,
            trust_score
          )
        `)
        .single();

      if (error) {
        console.error('Error updating task:', error);
        return { error: error.message };
      }

      // Update local state
      setTasks(prev => prev.map(task => task.id === taskId ? data : task));

      // Handle status-specific updates
      if (updates.status) {
        await handleStatusChange(data, updates.status);
      }

      return { data };
    } catch (err) {
      console.error('Unexpected error updating task:', err);
      return { error: 'Erreur lors de la mise à jour de la tâche' };
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      if (!taskId) {
        return { error: 'ID de la tâche requis' };
      }

      // Check if task can be deleted (only drafts and posted tasks without applications)
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        return { error: 'Tâche introuvable' };
      }

      if (!['draft', 'posted'].includes(task.status) || (task.applicant_count && task.applicant_count > 0)) {
        return { error: 'Cette tâche ne peut pas être supprimée car elle a des candidatures' };
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        return { error: error.message };
      }

      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return {};
    } catch (err) {
      console.error('Unexpected error deleting task:', err);
      return { error: 'Erreur lors de la suppression de la tâche' };
    }
  };

  const incrementViewCount = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          views_count: supabase.sql`views_count + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (!error) {
        // Update local state
        setTasks(prev => prev.map(task =>
          task.id === taskId
            ? { ...task, views_count: (task.views_count || 0) + 1 }
            : task
        ));
      }
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByUrgency = (urgency: TaskUrgency) => {
    return tasks.filter(task => task.urgency === urgency);
  };

  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const urgentTasks = tasks.filter(t => t.urgency === 'high' || t.urgency === 'emergency').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

    return {
      totalTasks,
      urgentTasks,
      completedTasks,
      inProgressTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  };

  // Helper functions
  const notifyRelevantProviders = async (task: Task) => {
    // This would typically be handled by database triggers or background jobs
    // For now, we'll skip the implementation
  };

  const getValidStatusTransitions = () => {
    return {
      draft: ['posted', 'cancelled'],
      posted: ['applications', 'cancelled'],
      applications: ['selected', 'cancelled'],
      selected: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled', 'disputed'],
      completed: ['disputed'],
      cancelled: [],
      disputed: ['completed', 'cancelled'],
    };
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    // Handle specific status change logic
    switch (newStatus) {
      case 'in_progress':
        // Start tracking session, notify participants
        break;
      case 'completed':
        // Create payment request, enable reviews
        break;
      case 'cancelled':
        // Handle refunds, notify participants
        break;
    }
  };

  // Real-time subscription for task updates
  useEffect(() => {
    const subscription = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          // Refetch tasks when changes occur
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    incrementViewCount,
    getTasksByStatus,
    getTasksByUrgency,
    getTaskStats,
    refetch: fetchTasks,
  };
};