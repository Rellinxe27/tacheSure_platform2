// utils/offlineStorage.ts
// Utility for offline-first data storage and synchronization

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

// Types for offline storage
interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineData {
  [key: string]: any[];
}

// Keys for AsyncStorage
const SYNC_QUEUE_KEY = 'tachesure_sync_queue';
const OFFLINE_DATA_KEY = 'tachesure_offline_data';
const LAST_SYNC_KEY = 'tachesure_last_sync';

/**
 * Initialize the offline storage system
 * This should be called when the app starts
 */
export async function initOfflineStorage(): Promise<void> {
  try {
    // Check if we have a sync queue already
    const syncQueue = await getSyncQueue();
    if (!syncQueue || syncQueue.length === 0) {
      // Initialize empty sync queue
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));
    }

    // Check if we have offline data already
    const offlineData = await getOfflineData();
    if (!offlineData) {
      // Initialize empty offline data
      await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify({}));
    }

    // Set up network change listener
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        // When connection is restored, try to sync
        syncWithServer();
      }
    });

    console.log('Offline storage initialized');
  } catch (error) {
    console.error('Error initializing offline storage:', error);
  }
}

/**
 * Get data with offline support
 * First tries to get from local storage, then from server if online
 */
export async function getOfflineData(): Promise<OfflineData | null> {
  try {
    const offlineDataString = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
    return offlineDataString ? JSON.parse(offlineDataString) : null;
  } catch (error) {
    console.error('Error getting offline data:', error);
    return null;
  }
}

/**
 * Get the sync queue
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const queueString = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueString ? JSON.parse(queueString) : [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
}

/**
 * Add an item to the sync queue
 */
export async function addToSyncQueue(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: any
): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const newItem: SyncQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      table,
      operation,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };
    queue.push(newItem);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
}

/**
 * Remove an item from the sync queue
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const newQueue = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
  } catch (error) {
    console.error('Error removing from sync queue:', error);
  }
}

/**
 * Update offline data
 */
export async function updateOfflineData(table: string, data: any[]): Promise<void> {
  try {
    const offlineData = await getOfflineData() || {};
    offlineData[table] = data;
    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
  } catch (error) {
    console.error('Error updating offline data:', error);
  }
}

/**
 * Fetch data from server with offline support
 */
export async function fetchWithOfflineSupport<T>(
  table: string,
  query: any,
  options: { forceRefresh?: boolean } = {}
): Promise<T[]> {
  try {
    // Check network status
    const networkState = await NetInfo.fetch();
    const isOnline = networkState.isConnected;

    // Get cached data
    const offlineData = await getOfflineData() || {};
    const cachedData = offlineData[table] || [];

    // If we're offline or not forcing refresh, return cached data
    if (!isOnline || (!options.forceRefresh && cachedData.length > 0)) {
      console.log(`Using cached data for ${table}`);
      return cachedData as T[];
    }

    // If we're online, fetch from server
    console.log(`Fetching fresh data for ${table}`);
    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return cachedData as T[];
    }

    // Update cache with fresh data
    if (data) {
      await updateOfflineData(table, data);
      // Update last sync time
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    }

    return (data || []) as T[];
  } catch (error) {
    console.error(`Error in fetchWithOfflineSupport for ${table}:`, error);
    // Return cached data as fallback
    const offlineData = await getOfflineData() || {};
    return (offlineData[table] || []) as T[];
  }
}

/**
 * Save data with offline support
 */
export async function saveWithOfflineSupport(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: any,
  condition?: { column: string; value: any }
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    // Check network status
    const networkState = await NetInfo.fetch();
    const isOnline = networkState.isConnected;

    // If offline, add to sync queue
    if (!isOnline) {
      await addToSyncQueue(table, operation, { data, condition });
      
      // For insert/update operations, update local cache immediately
      if (operation !== 'delete') {
        const offlineData = await getOfflineData() || {};
        const tableData = offlineData[table] || [];
        
        if (operation === 'insert') {
          // Add temporary ID for new items
          data._offlineId = `offline_${Date.now()}`;
          tableData.push(data);
        } else if (operation === 'update' && condition) {
          // Update existing item
          const index = tableData.findIndex(item => item[condition.column] === condition.value);
          if (index >= 0) {
            tableData[index] = { ...tableData[index], ...data };
          }
        }
        
        offlineData[table] = tableData;
        await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
      }
      
      return { success: true, data };
    }

    // If online, save directly to server
    let result;
    
    if (operation === 'insert') {
      result = await supabase.from(table).insert(data).select();
    } else if (operation === 'update' && condition) {
      result = await supabase.from(table).update(data).eq(condition.column, condition.value).select();
    } else if (operation === 'delete' && condition) {
      result = await supabase.from(table).delete().eq(condition.column, condition.value);
    } else {
      throw new Error('Invalid operation or missing condition');
    }

    if (result.error) {
      throw result.error;
    }

    // Update local cache with server response
    const offlineData = await getOfflineData() || {};
    
    if (operation === 'delete' && condition) {
      // Remove from cache
      offlineData[table] = (offlineData[table] || []).filter(
        item => item[condition.column] !== condition.value
      );
    } else {
      // Get fresh data for the table
      const { data: freshData } = await supabase.from(table).select('*');
      if (freshData) {
        offlineData[table] = freshData;
      }
    }
    
    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error in saveWithOfflineSupport for ${table}:`, error);
    return { success: false, error };
  }
}

/**
 * Sync pending changes with the server
 */
export async function syncWithServer(): Promise<{ success: boolean; syncedCount: number }> {
  try {
    // Check if we're online
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      return { success: false, syncedCount: 0 };
    }

    // Get the sync queue
    const queue = await getSyncQueue();
    if (queue.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    console.log(`Syncing ${queue.length} pending changes...`);
    
    let syncedCount = 0;
    
    // Process each item in the queue
    for (const item of queue) {
      try {
        if (item.operation === 'insert') {
          await supabase.from(item.table).insert(item.data.data);
        } else if (item.operation === 'update' && item.data.condition) {
          await supabase
            .from(item.table)
            .update(item.data.data)
            .eq(item.data.condition.column, item.data.condition.value);
        } else if (item.operation === 'delete' && item.data.condition) {
          await supabase
            .from(item.table)
            .delete()
            .eq(item.data.condition.column, item.data.condition.value);
        }
        
        // Remove from queue if successful
        await removeFromSyncQueue(item.id);
        syncedCount++;
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error);
        
        // Increment retry count
        const updatedQueue = await getSyncQueue();
        const itemIndex = updatedQueue.findIndex(i => i.id === item.id);
        
        if (itemIndex >= 0) {
          updatedQueue[itemIndex].retryCount++;
          
          // If too many retries, remove from queue
          if (updatedQueue[itemIndex].retryCount > 5) {
            updatedQueue.splice(itemIndex, 1);
          }
          
          await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
        }
      }
    }
    
    // Refresh all cached data after sync
    if (syncedCount > 0) {
      await refreshAllCachedData();
    }
    
    return { success: true, syncedCount };
  } catch (error) {
    console.error('Error syncing with server:', error);
    return { success: false, syncedCount: 0 };
  }
}

/**
 * Refresh all cached data
 */
export async function refreshAllCachedData(): Promise<void> {
  try {
    const offlineData = await getOfflineData() || {};
    
    // Refresh each table in the cache
    for (const table of Object.keys(offlineData)) {
      const { data } = await supabase.from(table).select('*');
      if (data) {
        offlineData[table] = data;
      }
    }
    
    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    
    console.log('All cached data refreshed');
  } catch (error) {
    console.error('Error refreshing cached data:', error);
  }
}

/**
 * Get the last sync time
 */
export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const lastSyncString = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return lastSyncString ? new Date(parseInt(lastSyncString)) : null;
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
}

/**
 * Clear all offline data (for logout)
 */
export async function clearOfflineData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
    await AsyncStorage.removeItem(LAST_SYNC_KEY);
    console.log('Offline data cleared');
  } catch (error) {
    console.error('Error clearing offline data:', error);
  }
}

/**
 * Get pending sync count
 */
export async function getPendingSyncCount(): Promise<number> {
  try {
    const queue = await getSyncQueue();
    return queue.length;
  } catch (error) {
    console.error('Error getting pending sync count:', error);
    return 0;
  }
}

/**
 * Check if there are pending changes to sync
 */
export async function hasPendingChanges(): Promise<boolean> {
  const count = await getPendingSyncCount();
  return count > 0;
}

/**
 * SMS fallback for critical communications when offline
 * This is a simulated implementation
 */
export async function sendSMSFallback(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean }> {
  try {
    // In a real implementation, this would use a native SMS API
    console.log(`[SMS FALLBACK] To: ${phoneNumber}, Message: ${message}`);
    
    // Simulate SMS sending
    if (Platform.OS !== 'web') {
      // Would use a native SMS API here
      return { success: true };
    }
    
    // For web or simulation, just log it
    console.log('SMS fallback simulated (would use native SMS API on device)');
    return { success: true };
  } catch (error) {
    console.error('Error sending SMS fallback:', error);
    return { success: false };
  }
}

/**
 * USSD fallback for basic functions when offline
 * This is a simulated implementation
 */
export async function sendUSSDRequest(
  code: string
): Promise<{ success: boolean; response?: string }> {
  try {
    // In a real implementation, this would use a native USSD API
    console.log(`[USSD REQUEST] Code: ${code}`);
    
    // Simulate USSD request
    if (Platform.OS !== 'web') {
      // Would use a native USSD API here
      return { success: true, response: 'Simulated USSD response' };
    }
    
    // For web or simulation, just log it
    console.log('USSD request simulated (would use native USSD API on device)');
    return { success: true, response: 'Simulated USSD response' };
  } catch (error) {
    console.error('Error sending USSD request:', error);
    return { success: false };
  }
}

/**
 * Mesh network for device-to-device communication when offline
 * This is a simulated implementation
 */
export async function sendMeshNetworkMessage(
  message: any,
  targetDevices: string[]
): Promise<{ success: boolean; reachedDevices: string[] }> {
  try {
    // In a real implementation, this would use a mesh networking library
    console.log(`[MESH NETWORK] Message to ${targetDevices.length} devices:`, message);
    
    // Simulate mesh network communication
    console.log('Mesh network communication simulated');
    
    // Simulate some devices being reached
    const reachedDevices = targetDevices.filter(() => Math.random() > 0.3);
    
    return { success: true, reachedDevices };
  } catch (error) {
    console.error('Error sending mesh network message:', error);
    return { success: false, reachedDevices: [] };
  }
}