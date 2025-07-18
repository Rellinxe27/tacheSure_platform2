// hooks/useTaskStatus.ts
// React hook for managing task status updates with persistent data

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { useDynamicIslandNotification } from '@/components/SnackBar';
import {
  updateTaskStatusWithPersistence,
  getProviderAvailability,
  TimeSlot
} from '@/utils/calendarTaskManager';

interface TaskStatusHookOptions {
  taskId: string;
  onStatusChange?: (newStatus: string) => void;
  onError?: (error: string) => void;
}

interface TaskStatusActions {
  acceptTask: (timeSlot: TimeSlot) => Promise<{ success: boolean; error?: string }>;
  declineTask: (reason?: string) => Promise<{ success: boolean; error?: string }>;
  startTask: () => Promise<{ success: boolean; error?: string }>;
  completeTask: () => Promise<{ success: boolean; error?: string }>;
  cancelTask: (reason: string) => Promise<{ success: boolean; error?: string }>;
  updateStatus: (newStatus: string, additionalData?: any) => Promise<{ success: boolean; error?: string }>;
}

interface TaskStatusState {
  task: any;
  loading: boolean;
  updating: boolean;
  availableSlots: TimeSlot[];
  loadingSlots: boolean;
}

export function useTaskStatus(options: TaskStatusHookOptions): TaskStatusState & TaskStatusActions {
  const { taskId, onStatusChange, onError } = options;
  const { user, profile } = useAuth();
  const { showNotification } = useDynamicIslandNotification();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch task details
  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  // Set up real-time subscription for task updates
  useEffect(() => {
    if (!taskId) return;

    const channel = supabase
      .channel(`task-status-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `id=eq.${taskId}`
        },
        (payload) => {
          console.log('Task updated via real-time:', payload.new);
          setTask(payload.new);
          onStatusChange?.(payload.new.status);

          // Show notification for status changes
          const statusMessages = {
            'applications': 'Tâche acceptée',
            'cancelled': 'Tâche annulée',
            'in_progress': 'Tâche commencée',
            'completed': 'Tâche terminée'
          };

          const message = statusMessages[payload.new.status as keyof typeof statusMessages];
          if (message) {
            showNotification(message, 'info');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, onStatusChange]);

  // Fetch provider availability when user is a provider
  useEffect(() => {
    if (profile?.role === 'provider' && user?.id) {
      fetchProviderSlots();
    }
  }, [profile, user]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          client:profiles!client_id (
            id, full_name, avatar_url, trust_score, is_verified, verification_level
          ),
          provider:profiles!provider_id (
            id, full_name, avatar_url, trust_score, is_verified, verification_level
          ),
          categories (name_fr, icon)
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      onError?.('Erreur lors du chargement de la tâche');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderSlots = async () => {
    if (!user?.id) return;

    try {
      setLoadingSlots(true);
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 14); // Next 2 weeks

      const slots = await getProviderAvailability(
        user.id,
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setAvailableSlots(slots.filter(slot => slot.is_available && !slot.is_booked));
    } catch (error) {
      console.error('Error fetching provider slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const acceptTask = async (timeSlot: TimeSlot): Promise<{ success: boolean; error?: string }> => {
    if (!task || !user) {
      return { success: false, error: 'Données manquantes' };
    }

    try {
      setUpdating(true);

      const result = await updateTaskStatusWithPersistence(
        taskId,
        'applications',
        user.id,
        {
          date: timeSlot.date,
          start_time: timeSlot.start_time,
          end_time: timeSlot.end_time,
          notes: 'Tâche acceptée par le prestataire'
        }
      );

      if (result.success) {
        showNotification(
          `Tâche acceptée! RDV le ${timeSlot.date} à ${timeSlot.start_time}`,
          'success'
        );

        // Update local task state
        setTask((prev: any) => prev ? {
          ...prev,
          status: 'applications',
          provider_id: user.id,
          responded_at: new Date().toISOString(),
          scheduled_at: `${timeSlot.date}T${timeSlot.start_time}:00`
        } : null);

        // Refresh available slots
        await fetchProviderSlots();
      } else {
        showNotification(result.error || 'Erreur lors de l\'acceptation', 'error');
      }

      return result;
    } catch (error) {
      console.error('Error accepting task:', error);
      const errorMessage = 'Erreur lors de l\'acceptation de la tâche';
      showNotification(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  const declineTask = async (reason?: string): Promise<{ success: boolean; error?: string }> => {
    if (!task || !user) {
      return { success: false, error: 'Données manquantes' };
    }

    try {
      setUpdating(true);

      const result = await updateTaskStatusWithPersistence(
        taskId,
        'cancelled',
        undefined, // No provider assignment for declined tasks
        undefined
      );

      if (result.success) {
        showNotification('Tâche déclinée', 'info');

        // Update local task state
        setTask((prev: any) => prev ? {
          ...prev,
          status: 'cancelled',
          responded_at: new Date().toISOString()
        } : null);
      } else {
        showNotification(result.error || 'Erreur lors du déclin', 'error');
      }

      return result;
    } catch (error) {
      console.error('Error declining task:', error);
      const errorMessage = 'Erreur lors du déclin de la tâche';
      showNotification(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  const startTask = async (): Promise<{ success: boolean; error?: string }> => {
    if (!task || !user) {
      return { success: false, error: 'Données manquantes' };
    }

    try {
      setUpdating(true);

      const result = await updateTaskStatusWithPersistence(
        taskId,
        'in_progress',
        user.id
      );

      if (result.success) {
        showNotification('Tâche commencée', 'success');

        setTask((prev: any) => prev ? {
          ...prev,
          status: 'in_progress',
          actual_start_time: new Date().toISOString()
        } : null);
      } else {
        showNotification(result.error || 'Erreur lors du démarrage', 'error');
      }

      return result;
    } catch (error) {
      console.error('Error starting task:', error);
      const errorMessage = 'Erreur lors du démarrage de la tâche';
      showNotification(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  const completeTask = async (): Promise<{ success: boolean; error?: string }> => {
    if (!task || !user) {
      return { success: false, error: 'Données manquantes' };
    }

    try {
      setUpdating(true);

      const result = await updateTaskStatusWithPersistence(
        taskId,
        'completed',
        user.id
      );

      if (result.success) {
        showNotification('Tâche terminée avec succès', 'success');

        setTask((prev: any) => prev ? {
          ...prev,
          status: 'completed',
          actual_end_time: new Date().toISOString(),
          completed_at: new Date().toISOString()
        } : null);

        // Refresh available slots to show freed time
        if (profile?.role === 'provider') {
          await fetchProviderSlots();
        }
      } else {
        showNotification(result.error || 'Erreur lors de la finalisation', 'error');
      }

      return result;
    } catch (error) {
      console.error('Error completing task:', error);
      const errorMessage = 'Erreur lors de la finalisation de la tâche';
      showNotification(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  const cancelTask = async (reason: string): Promise<{ success: boolean; error?: string }> => {
    if (!task || !user) {
      return { success: false, error: 'Données manquantes' };
    }

    try {
      setUpdating(true);

      // Cancel any associated booking
      if (task.provider_id) {
        const { data: booking } = await supabase
          .from('provider_bookings')
          .select('id')
          .eq('task_id', taskId)
          .eq('status', 'confirmed')
          .single();

        if (booking) {
          await supabase
            .from('provider_bookings')
            .update({
              status: 'cancelled',
              notes: `Cancelled: ${reason}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', booking.id);
        }
      }

      const result = await updateTaskStatusWithPersistence(
        taskId,
        'cancelled'
      );

      if (result.success) {
        showNotification('Tâche annulée', 'info');

        setTask((prev: any) => prev ? {
          ...prev,
          status: 'cancelled',
          updated_at: new Date().toISOString()
        } : null);

        // Refresh available slots if provider
        if (profile?.role === 'provider') {
          await fetchProviderSlots();
        }
      } else {
        showNotification(result.error || 'Erreur lors de l\'annulation', 'error');
      }

      return result;
    } catch (error) {
      console.error('Error cancelling task:', error);
      const errorMessage = 'Erreur lors de l\'annulation de la tâche';
      showNotification(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (
    newStatus: string,
    additionalData?: any
  ): Promise<{ success: boolean; error?: string }> => {
    if (!task || !user) {
      return { success: false, error: 'Données manquantes' };
    }

    try {
      setUpdating(true);

      const result = await updateTaskStatusWithPersistence(
        taskId,
        newStatus,
        user.id,
        additionalData
      );

      if (result.success) {
        showNotification(`Statut mis à jour: ${newStatus}`, 'success');

        setTask((prev: any) => prev ? {
          ...prev,
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...additionalData
        } : null);
      } else {
        showNotification(result.error || 'Erreur lors de la mise à jour', 'error');
      }

      return result;
    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage = 'Erreur lors de la mise à jour du statut';
      showNotification(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  return {
    // State
    task,
    loading,
    updating,
    availableSlots,
    loadingSlots,

    // Actions
    acceptTask,
    declineTask,
    startTask,
    completeTask,
    cancelTask,
    updateStatus
  };
}

/**
 * Hook for managing task status from the client perspective
 */
export function useClientTaskStatus(taskId: string) {
  const baseHook = useTaskStatus({
    taskId,
    onStatusChange: (newStatus) => {
      console.log(`Task ${taskId} status changed to: ${newStatus}`);
    }
  });

  // Client-specific actions
  const approveCompletion = async (): Promise<{ success: boolean; error?: string }> => {
    return baseHook.updateStatus('completed');
  };

  const requestRevision = async (reason: string): Promise<{ success: boolean; error?: string }> => {
    return baseHook.updateStatus('in_progress', { revision_requested: true, revision_reason: reason });
  };

  const disputeTask = async (reason: string): Promise<{ success: boolean; error?: string }> => {
    return baseHook.updateStatus('disputed', { dispute_reason: reason });
  };

  return {
    ...baseHook,
    approveCompletion,
    requestRevision,
    disputeTask
  };
}

/**
 * Hook for managing task status from the provider perspective
 */
export function useProviderTaskStatus(taskId: string) {
  const baseHook = useTaskStatus({
    taskId,
    onStatusChange: (newStatus) => {
      console.log(`Task ${taskId} status changed to: ${newStatus}`);
    }
  });

  return {
    ...baseHook,
    // Provider-specific methods can be added here
  };
}