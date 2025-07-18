// utils/calendarTaskManager.ts
// Utilities for managing calendar integration and task persistence

import { supabase } from '@/lib/supabase';
import { NotificationService } from './notificationService';

export interface TimeSlot {
  id?: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked?: boolean;
  task_id?: string;
}

export interface ProviderBooking {
  id?: string;
  provider_id: string;
  client_id: string;
  task_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  notes?: string;
}

export interface TaskStatusUpdate {
  task_id: string;
  old_status: string;
  new_status: string;
  provider_id?: string;
  client_id: string;
  scheduled_at?: string;
  booking_details?: ProviderBooking;
}

/**
 * Calendar Management Functions
 */

/**
 * Get provider's availability for a date range
 */
export async function getProviderAvailability(
  providerId: string,
  startDate: string,
  endDate: string
): Promise<TimeSlot[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_provider_availability', {
        provider_uuid: providerId,
        start_date: startDate,
        end_date: endDate
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching provider availability:', error);
    return [];
  }
}

/**
 * Create or update time slots for a provider
 */
export async function updateProviderTimeSlots(
  providerId: string,
  slots: Omit<TimeSlot, 'id' | 'provider_id'>[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const slotsWithProvider = slots.map(slot => ({
      ...slot,
      provider_id: providerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('time_slots')
      .upsert(slotsWithProvider, {
        onConflict: 'provider_id,date,start_time,end_time'
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating time slots:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Find available providers for a specific time slot and category
 */
export async function findAvailableProviders(
  date: string,
  startTime: string,
  endTime: string,
  categoryId?: string
): Promise<Array<{
  provider_id: string;
  provider_name: string;
  trust_score: number;
  is_verified: boolean;
}>> {
  try {
    const { data, error } = await supabase
      .rpc('find_available_providers', {
        search_date: date,
        search_start_time: startTime,
        search_end_time: endTime,
        category_uuid: categoryId || null
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error finding available providers:', error);
    return [];
  }
}

/**
 * Booking Management Functions
 */

/**
 * Create a new booking
 */
export async function createBooking(
  booking: Omit<ProviderBooking, 'id' | 'status'>
): Promise<{ success: boolean; data?: ProviderBooking; error?: string }> {
  try {
    // Check for conflicts before creating
    const conflicts = await checkBookingConflicts(
      booking.provider_id,
      booking.date,
      booking.start_time,
      booking.end_time
    );

    if (conflicts.length > 0) {
      return {
        success: false,
        error: 'Conflit de réservation détecté'
      };
    }

    const { data, error } = await supabase
      .from('provider_bookings')
      .insert({
        ...booking,
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check for booking conflicts
 */
export async function checkBookingConflicts(
  providerId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<ProviderBooking[]> {
  try {
    let query = supabase
      .from('provider_bookings')
      .select('*')
      .eq('provider_id', providerId)
      .eq('date', date)
      .neq('status', 'cancelled')
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`);

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error checking booking conflicts:', error);
    return [];
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: ProviderBooking['status'],
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('provider_bookings')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get provider's bookings
 */
export async function getProviderBookings(
  providerId: string,
  startDate?: string,
  endDate?: string
): Promise<Array<ProviderBooking & {
  task_title?: string;
  client_name?: string;
}>> {
  try {
    let query = supabase
      .from('provider_bookings')
      .select(`
        *,
        task:tasks(title),
        client:profiles!client_id(full_name)
      `)
      .eq('provider_id', providerId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(booking => ({
      ...booking,
      task_title: booking.task?.title,
      client_name: booking.client?.full_name
    }));
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    return [];
  }
}

/**
 * Task Status Management Functions
 */

/**
 * Update task status with proper notifications and calendar updates
 */
export async function updateTaskStatusWithPersistence(
  taskId: string,
  newStatus: string,
  providerId?: string,
  bookingDetails?: Partial<ProviderBooking>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current task data
    const { data: currentTask, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;

    const oldStatus = currentTask.status;
    const timestamp = new Date().toISOString();

    // Start a transaction-like operation
    const updates: Promise<any>[] = [];

    // 1. Update task status
    const taskUpdate: any = {
      status: newStatus,
      updated_at: timestamp
    };

    if (providerId) {
      taskUpdate.provider_id = providerId;
    }

    if (newStatus === 'applications') {
      taskUpdate.responded_at = timestamp;
    } else if (newStatus === 'in_progress') {
      taskUpdate.actual_start_time = timestamp;
    } else if (newStatus === 'completed') {
      taskUpdate.actual_end_time = timestamp;
      taskUpdate.completed_at = timestamp;
    }

    // Add booking details if provided
    if (bookingDetails && newStatus === 'applications') {
      taskUpdate.scheduled_at = `${bookingDetails.date}T${bookingDetails.start_time}:00`;
      taskUpdate.estimated_duration = calculateDuration(
        bookingDetails.start_time || '',
        bookingDetails.end_time || ''
      );
    }

    updates.push(
      supabase
        .from('tasks')
        .update(taskUpdate)
        .eq('id', taskId)
    );

    // 2. Create booking if accepting task
    if (newStatus === 'applications' && bookingDetails && providerId) {
      updates.push(
        supabase
          .from('provider_bookings')
          .insert({
            provider_id: providerId,
            client_id: currentTask.client_id,
            task_id: taskId,
            date: bookingDetails.date,
            start_time: bookingDetails.start_time,
            end_time: bookingDetails.end_time,
            status: 'confirmed',
            notes: bookingDetails.notes || 'Booking created from task acceptance',
            created_at: timestamp,
            updated_at: timestamp
          })
      );

      // 3. Update time slot availability
      updates.push(
        supabase
          .from('time_slots')
          .upsert({
            provider_id: providerId,
            date: bookingDetails.date,
            start_time: bookingDetails.start_time,
            end_time: bookingDetails.end_time,
            is_available: false,
            is_booked: true,
            task_id: taskId,
            created_at: timestamp,
            updated_at: timestamp
          })
      );
    }

    // 4. Create notifications based on status change
    const notifications = generateStatusChangeNotifications(
      currentTask,
      oldStatus,
      newStatus,
      providerId,
      bookingDetails
    );

    if (notifications.length > 0) {
      updates.push(
        supabase
          .from('notifications')
          .insert(notifications)
      );
    }

    // Execute all updates
    const results = await Promise.allSettled(updates);

    // Check if any operations failed
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.error('Some operations failed:', failures);
      throw new Error('Certaines opérations ont échoué');
    }

    // Send push notifications
    if (notifications.length > 0) {
      await sendPushNotificationsForStatusChange(
        currentTask,
        oldStatus,
        newStatus,
        providerId,
        bookingDetails
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating task status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate notifications for status changes
 */
function generateStatusChangeNotifications(
  task: any,
  oldStatus: string,
  newStatus: string,
  providerId?: string,
  bookingDetails?: Partial<ProviderBooking>
): Array<{
  user_id: string;
  title: string;
  message: string;
  type: string;
  data: any;
  action_url: string;
  created_at: string;
}> {
  const notifications = [];
  const timestamp = new Date().toISOString();

  if (newStatus === 'applications' && oldStatus === 'posted') {
    // Provider accepted the task
    notifications.push({
      user_id: task.client_id,
      title: 'Demande acceptée',
      message: 'Votre demande a été acceptée par un prestataire',
      type: 'task_update',
      data: {
        task_id: task.id,
        provider_id: providerId,
        task_title: task.title,
        response: 'accepted',
        ...(bookingDetails ? {
          scheduled_date: bookingDetails.date,
          scheduled_time: `${bookingDetails.start_time} - ${bookingDetails.end_time}`,
          action_text: 'Voir les détails'
        } : {})
      },
      action_url: `/task/${task.id}`,
      created_at: timestamp
    });
  } else if (newStatus === 'cancelled') {
    // Task was cancelled
    notifications.push({
      user_id: task.client_id,
      title: 'Demande annulée',
      message: 'Votre demande a été annulée',
      type: 'task_update',
      data: {
        task_id: task.id,
        task_title: task.title,
        response: 'rejected',
        action_text: 'Voir les détails'
      },
      action_url: `/task/${task.id}`,
      created_at: timestamp
    });
  } else if (newStatus === 'in_progress' && oldStatus === 'applications') {
    // Task started
    notifications.push({
      user_id: task.client_id,
      title: 'Service commencé',
      message: 'Votre service a commencé',
      type: 'task_update',
      data: {
        task_id: task.id,
        provider_id: providerId,
        task_title: task.title,
        action_text: 'Suivre le service'
      },
      action_url: `/task/${task.id}`,
      created_at: timestamp
    });
  } else if (newStatus === 'completed' && oldStatus === 'in_progress') {
    // Task completed - notify both parties
    notifications.push(
      {
        user_id: task.client_id,
        title: 'Service terminé',
        message: 'Votre service a été terminé',
        type: 'task_update',
        data: {
          task_id: task.id,
          provider_id: providerId,
          task_title: task.title,
          action_text: 'Laisser un avis'
        },
        action_url: `/task/${task.id}/review`,
        created_at: timestamp
      },
      {
        user_id: providerId || task.provider_id,
        title: 'Service terminé',
        message: 'Vous avez terminé ce service',
        type: 'task_update',
        data: {
          task_id: task.id,
          client_id: task.client_id,
          task_title: task.title,
          action_text: 'Voir les détails'
        },
        action_url: `/task/${task.id}`,
        created_at: timestamp
      }
    );
  }

  return notifications;
}

/**
 * Send push notifications for status changes
 */
async function sendPushNotificationsForStatusChange(
  task: any,
  oldStatus: string,
  newStatus: string,
  providerId?: string,
  bookingDetails?: Partial<ProviderBooking>
): Promise<void> {
  try {
    if (newStatus === 'applications' && oldStatus === 'posted') {
      await NotificationService.notifyClientOfBookingUpdate(
        task.client_id,
        'Un prestataire',
        task.title,
        'accepted',
        task.id
      );
    } else if (newStatus === 'cancelled') {
      await NotificationService.notifyClientOfBookingUpdate(
        task.client_id,
        'Le prestataire',
        task.title,
        'rejected',
        task.id
      );
    } else if (newStatus === 'in_progress') {
      await NotificationService.notifyClientOfBookingUpdate(
        task.client_id,
        'Votre prestataire',
        task.title,
        'started',
        task.id
      );
    } else if (newStatus === 'completed') {
      await NotificationService.notifyClientOfBookingUpdate(
        task.client_id,
        'Votre prestataire',
        task.title,
        'completed',
        task.id
      );
    }
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
}

/**
 * Calculate duration between two time strings
 */
function calculateDuration(startTime: string, endTime: string): string {
  try {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (minutes === 0) {
      return `${hours} hours`;
    }
    return `${hours} hours ${minutes} minutes`;
  } catch (error) {
    return '2 hours'; // Default fallback
  }
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(
  bookingId: string,
  newDate: string,
  newStartTime: string,
  newEndTime: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('provider_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError) throw fetchError;

    // Check for conflicts with new time
    const conflicts = await checkBookingConflicts(
      currentBooking.provider_id,
      newDate,
      newStartTime,
      newEndTime,
      bookingId
    );

    if (conflicts.length > 0) {
      return { success: false, error: 'Conflit avec une autre réservation' };
    }

    const timestamp = new Date().toISOString();

    // Update booking
    const { error: updateError } = await supabase
      .from('provider_bookings')
      .update({
        date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
        status: 'rescheduled',
        notes: `${currentBooking.notes || ''}\nReprogrammé: ${reason || 'Aucune raison spécifiée'}`,
        updated_at: timestamp
      })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    // Free up old time slot
    await supabase
      .from('time_slots')
      .update({
        is_available: true,
        is_booked: false,
        task_id: null,
        updated_at: timestamp
      })
      .eq('provider_id', currentBooking.provider_id)
      .eq('date', currentBooking.date)
      .eq('start_time', currentBooking.start_time)
      .eq('end_time', currentBooking.end_time);

    // Book new time slot
    await supabase
      .from('time_slots')
      .upsert({
        provider_id: currentBooking.provider_id,
        date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
        is_available: false,
        is_booked: true,
        task_id: currentBooking.task_id,
        created_at: timestamp,
        updated_at: timestamp
      });

    // Update task scheduled time
    await supabase
      .from('tasks')
      .update({
        scheduled_at: `${newDate}T${newStartTime}:00`,
        updated_at: timestamp
      })
      .eq('id', currentBooking.task_id);

    // Notify client about reschedule
    await supabase
      .from('notifications')
      .insert({
        user_id: currentBooking.client_id,
        title: 'Réservation reprogrammée',
        message: `Votre réservation a été reprogrammée pour le ${newDate} à ${newStartTime}`,
        type: 'task_update',
        data: {
          task_id: currentBooking.task_id,
          booking_id: bookingId,
          old_date: currentBooking.date,
          old_time: `${currentBooking.start_time} - ${currentBooking.end_time}`,
          new_date: newDate,
          new_time: `${newStartTime} - ${newEndTime}`,
          reason: reason,
          action_text: 'Voir les détails'
        },
        action_url: `/task/${currentBooking.task_id}`,
        created_at: timestamp
      });

    return { success: true };
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel a booking and free up the time slot
 */
export async function cancelBooking(
  bookingId: string,
  reason: string,
  cancelledBy: 'provider' | 'client'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current booking
    const { data: booking, error: fetchError } = await supabase
      .from('provider_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError) throw fetchError;

    const timestamp = new Date().toISOString();

    // Update booking status
    await supabase
      .from('provider_bookings')
      .update({
        status: 'cancelled',
        notes: `${booking.notes || ''}\nAnnulé par ${cancelledBy}: ${reason}`,
        updated_at: timestamp
      })
      .eq('id', bookingId);

    // Free up time slot
    await supabase
      .from('time_slots')
      .update({
        is_available: true,
        is_booked: false,
        task_id: null,
        updated_at: timestamp
      })
      .eq('provider_id', booking.provider_id)
      .eq('date', booking.date)
      .eq('start_time', booking.start_time)
      .eq('end_time', booking.end_time);

    // Update task status to cancelled
    await supabase
      .from('tasks')
      .update({
        status: 'cancelled',
        updated_at: timestamp
      })
      .eq('id', booking.task_id);

    // Notify the other party
    const notifyUserId = cancelledBy === 'provider' ? booking.client_id : booking.provider_id;
    const notifyMessage = cancelledBy === 'provider'
      ? 'Le prestataire a annulé votre réservation'
      : 'Le client a annulé la réservation';

    await supabase
      .from('notifications')
      .insert({
        user_id: notifyUserId,
        title: 'Réservation annulée',
        message: notifyMessage,
        type: 'task_update',
        data: {
          task_id: booking.task_id,
          booking_id: bookingId,
          cancelled_by: cancelledBy,
          reason: reason,
          action_text: 'Voir les détails'
        },
        action_url: `/task/${booking.task_id}`,
        created_at: timestamp
      });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get provider's schedule for calendar view
 */
export async function getProviderSchedule(
  providerId: string,
  startDate: string,
  endDate: string
): Promise<{
  availability: TimeSlot[];
  bookings: Array<ProviderBooking & { task_title: string; client_name: string }>;
}> {
  try {
    // Get availability slots
    const availability = await getProviderAvailability(providerId, startDate, endDate);

    // Get bookings
    const bookings = await getProviderBookings(providerId, startDate, endDate);

    return { availability, bookings };
  } catch (error) {
    console.error('Error getting provider schedule:', error);
    return { availability: [], bookings: [] };
  }
}

/**
 * Bulk update provider availability
 */
export async function bulkUpdateProviderAvailability(
  providerId: string,
  weeklySchedule: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update availability schedules
    const { error: scheduleError } = await supabase
      .from('availability_schedules')
      .upsert(
        weeklySchedule.map(schedule => ({
          provider_id: providerId,
          ...schedule,
          timezone: 'UTC', // Default timezone
          created_at: new Date().toISOString()
        })),
        { onConflict: 'provider_id,day_of_week' }
      );

    if (scheduleError) throw scheduleError;

    // Generate time slots for the next 30 days based on new schedule
    const slots = generateTimeSlotsFromSchedule(providerId, weeklySchedule, 30);

    // Update time slots
    const result = await updateProviderTimeSlots(
      providerId,
      slots.map(({ provider_id, ...slot }) => slot)
    );

    return result;
  } catch (error) {
    console.error('Error bulk updating availability:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate time slots from weekly schedule
 */
function generateTimeSlotsFromSchedule(
  providerId: string,
  weeklySchedule: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }>,
  daysAhead: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    const daySchedule = weeklySchedule.find(s => s.day_of_week === dayOfWeek);

    if (daySchedule && daySchedule.is_available) {
      // Generate 2-hour slots
      const startTime = new Date(`${date.toDateString()} ${daySchedule.start_time}`);
      const endTime = new Date(`${date.toDateString()} ${daySchedule.end_time}`);

      while (startTime < endTime) {
        const slotEnd = new Date(startTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours

        if (slotEnd <= endTime) {
          slots.push({
            provider_id: providerId,
            date: date.toISOString().split('T')[0],
            start_time: startTime.toTimeString().split(' ')[0].substring(0, 5),
            end_time: slotEnd.toTimeString().split(' ')[0].substring(0, 5),
            is_available: true,
            is_booked: false
          });
        }

        startTime.setTime(startTime.getTime() + (2 * 60 * 60 * 1000));
      }
    }
  }

  return slots;
}