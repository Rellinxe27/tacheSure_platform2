// utils/escrowPayment.ts
// Implementation of escrow payment system and milestone payments

import { supabase } from '@/lib/supabase';

/**
 * Types for escrow payment system
 */
export interface EscrowPayment {
  id: string;
  taskId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  escrowReleased: boolean;
  escrowReleasedAt?: string | null;
  paymentMethod: 'mtn_money' | 'orange_money' | 'moov_money' | 'wave' | 'bank_transfer' | 'cash' | 'crypto';
  createdAt: string;
}

export interface MilestonePayment {
  id: string;
  taskId: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'funded' | 'released' | 'disputed';
  dueDate?: string;
  completedAt?: string;
  paymentId?: string;
}

/**
 * Create a new escrow payment
 * Holds the payment in escrow until the task is completed
 */
export async function createEscrowPayment(
  taskId: string,
  payerId: string,
  payeeId: string,
  amount: number,
  paymentMethod: 'mtn_money' | 'orange_money' | 'moov_money' | 'wave' | 'bank_transfer' | 'cash' | 'crypto'
) {
  try {
    // Calculate fees (1.5% for mobile money, 0% for others)
    const feePercentage = paymentMethod.includes('money') ? 0.015 : 0;
    const feeAmount = Math.round(amount * feePercentage);
    const netAmount = amount - feeAmount;

    // Create payment record with escrow
    const { data, error } = await supabase
      .from('payments')
      .insert({
        task_id: taskId,
        payer_id: payerId,
        payee_id: payeeId,
        amount: amount,
        fee_amount: feeAmount,
        net_amount: netAmount,
        currency: 'FCFA',
        payment_method: paymentMethod,
        status: 'processing',
        escrow_released: false,
        metadata: {
          escrow_type: 'full',
          payment_description: 'Paiement sécurisé via système d\'entiercement'
        }
      })
      .select()
      .single();

    if (error) throw error;
    
    // Update task status to indicate payment has been made
    await supabase
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', taskId);
      
    return data;
  } catch (error) {
    console.error('Error creating escrow payment:', error);
    throw error;
  }
}

/**
 * Release funds from escrow to the service provider
 * Called when the client confirms the task is completed
 */
export async function releaseEscrowPayment(paymentId: string, taskId: string) {
  try {
    // Update payment to release escrow
    const { data, error } = await supabase
      .from('payments')
      .update({
        escrow_released: true,
        escrow_released_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    
    // Update task status to completed
    await supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);
      
    return data;
  } catch (error) {
    console.error('Error releasing escrow payment:', error);
    throw error;
  }
}

/**
 * Refund an escrow payment to the client
 * Called when there's a dispute or cancellation
 */
export async function refundEscrowPayment(paymentId: string, taskId: string, reason: string) {
  try {
    // Get the payment details first
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Update payment to refunded status
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refund_amount: payment.amount,
        refund_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    
    // Update task status to cancelled
    await supabase
      .from('tasks')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);
      
    return data;
  } catch (error) {
    console.error('Error refunding escrow payment:', error);
    throw error;
  }
}

/**
 * Create milestone payments for a task
 * Allows breaking down large projects into smaller payment milestones
 */
export async function createMilestonePayments(
  taskId: string,
  milestones: { title: string; description: string; amount: number; dueDate?: string }[]
) {
  try {
    // Create milestone records
    const milestonesData = milestones.map(milestone => ({
      task_id: taskId,
      title: milestone.title,
      description: milestone.description,
      amount: milestone.amount,
      status: 'pending',
      due_date: milestone.dueDate,
      created_at: new Date().toISOString()
    }));
    
    const { data, error } = await supabase
      .from('task_milestones')
      .insert(milestonesData)
      .select();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating milestone payments:', error);
    throw error;
  }
}

/**
 * Fund a specific milestone
 * Places the milestone payment in escrow
 */
export async function fundMilestone(
  milestoneId: string,
  payerId: string,
  payeeId: string,
  amount: number,
  paymentMethod: 'mtn_money' | 'orange_money' | 'moov_money' | 'wave' | 'bank_transfer' | 'cash' | 'crypto'
) {
  try {
    // Get milestone details
    const { data: milestone, error: milestoneError } = await supabase
      .from('task_milestones')
      .select('task_id')
      .eq('id', milestoneId)
      .single();
      
    if (milestoneError) throw milestoneError;
    
    // Create payment for this milestone
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        task_id: milestone.task_id,
        payer_id: payerId,
        payee_id: payeeId,
        amount: amount,
        currency: 'FCFA',
        payment_method: paymentMethod,
        status: 'processing',
        escrow_released: false,
        metadata: {
          escrow_type: 'milestone',
          milestone_id: milestoneId
        }
      })
      .select()
      .single();
      
    if (paymentError) throw paymentError;
    
    // Update milestone status
    const { data, error } = await supabase
      .from('task_milestones')
      .update({
        status: 'funded',
        payment_id: payment.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { milestone: data, payment };
  } catch (error) {
    console.error('Error funding milestone:', error);
    throw error;
  }
}

/**
 * Release a funded milestone to the service provider
 */
export async function releaseMilestone(milestoneId: string) {
  try {
    // Get milestone with payment details
    const { data: milestone, error: milestoneError } = await supabase
      .from('task_milestones')
      .select('payment_id, task_id')
      .eq('id', milestoneId)
      .single();
      
    if (milestoneError) throw milestoneError;
    
    // Release the payment from escrow
    if (milestone.payment_id) {
      await supabase
        .from('payments')
        .update({
          escrow_released: true,
          escrow_released_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', milestone.payment_id);
    }
    
    // Update milestone status
    const { data, error } = await supabase
      .from('task_milestones')
      .update({
        status: 'released',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Check if all milestones are completed
    const { data: milestones } = await supabase
      .from('task_milestones')
      .select('status')
      .eq('task_id', milestone.task_id);
      
    const allCompleted = milestones?.every(m => m.status === 'released');
    
    // If all milestones are completed, mark the task as completed
    if (allCompleted) {
      await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', milestone.task_id);
    }
    
    return data;
  } catch (error) {
    console.error('Error releasing milestone:', error);
    throw error;
  }
}

/**
 * Get all milestones for a task
 */
export async function getTaskMilestones(taskId: string) {
  try {
    const { data, error } = await supabase
      .from('task_milestones')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting task milestones:', error);
    throw error;
  }
}

/**
 * Get escrow payment status for a task
 */
export async function getEscrowStatus(taskId: string) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting escrow status:', error);
    return null;
  }
}