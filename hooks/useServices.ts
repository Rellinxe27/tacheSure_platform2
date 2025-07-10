// hooks/useServices.ts (Enhanced with better error handling and persistence)
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Service = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export const useServices = (providerId?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [providerId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('services')
        .select(`
          *,
          categories (
            id,
            name_fr,
            icon
          )
        `)
        .order('created_at', { ascending: false });

      if (providerId) {
        query = query.eq('provider_id', providerId);
      } else {
        // If no providerId specified, get all active services
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching services:', fetchError);
        setError(fetchError.message);
      } else {
        setServices(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching services:', err);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: ServiceInsert) => {
    try {
      // Validate required fields
      if (!serviceData.provider_id || !serviceData.name || !serviceData.description) {
        return { error: 'Données manquantes pour créer le service' };
      }

      if (!serviceData.price_min || !serviceData.price_max) {
        return { error: 'Les prix minimum et maximum sont obligatoires' };
      }

      if (serviceData.price_min > serviceData.price_max) {
        return { error: 'Le prix minimum ne peut pas être supérieur au prix maximum' };
      }

      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          categories (
            id,
            name_fr,
            icon
          )
        `)
        .single();

      if (error) {
        console.error('Error creating service:', error);
        return { error: error.message };
      }

      // Update local state
      setServices(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      console.error('Unexpected error creating service:', err);
      return { error: 'Erreur lors de la création du service' };
    }
  };

  const updateService = async (serviceId: string, updates: ServiceUpdate) => {
    try {
      if (!serviceId) {
        return { error: 'ID du service requis' };
      }

      // Validate price fields if they're being updated
      if (updates.price_min !== undefined && updates.price_max !== undefined) {
        if (updates.price_min > updates.price_max) {
          return { error: 'Le prix minimum ne peut pas être supérieur au prix maximum' };
        }
      }

      const { data, error } = await supabase
        .from('services')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select(`
          *,
          categories (
            id,
            name_fr,
            icon
          )
        `)
        .single();

      if (error) {
        console.error('Error updating service:', error);
        return { error: error.message };
      }

      // Update local state
      setServices(prev => prev.map(service => service.id === serviceId ? data : service));
      return { data };
    } catch (err) {
      console.error('Unexpected error updating service:', err);
      return { error: 'Erreur lors de la mise à jour du service' };
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      if (!serviceId) {
        return { error: 'ID du service requis' };
      }

      // Check if service has active tasks before deleting
      const { data: activeTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('provider_id', serviceId)
        .in('status', ['posted', 'applications', 'selected', 'in_progress']);

      if (activeTasks && activeTasks.length > 0) {
        return { error: 'Impossible de supprimer un service avec des tâches actives' };
      }

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('Error deleting service:', error);
        return { error: error.message };
      }

      // Update local state
      setServices(prev => prev.filter(service => service.id !== serviceId));
      return {};
    } catch (err) {
      console.error('Unexpected error deleting service:', err);
      return { error: 'Erreur lors de la suppression du service' };
    }
  };

  const toggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    return updateService(serviceId, { is_active: isActive });
  };

  const getServicesByCategory = (categoryId: string) => {
    return services.filter(service => service.category_id === categoryId && service.is_active);
  };

  const getServiceStats = () => {
    const totalServices = services.length;
    const activeServices = services.filter(s => s.is_active).length;
    const emergencyServices = services.filter(s => s.is_emergency_available).length;

    const avgPriceMin = totalServices > 0
      ? services.reduce((sum, s) => sum + s.price_min, 0) / totalServices
      : 0;

    const avgPriceMax = totalServices > 0
      ? services.reduce((sum, s) => sum + s.price_max, 0) / totalServices
      : 0;

    return {
      totalServices,
      activeServices,
      emergencyServices,
      avgPriceMin: Math.round(avgPriceMin),
      avgPriceMax: Math.round(avgPriceMax),
    };
  };

  // Real-time subscription for service updates
  useEffect(() => {
    if (!providerId) return;

    const subscription = supabase
      .channel(`services-${providerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `provider_id=eq.${providerId}`,
        },
        () => {
          // Refetch services when changes occur
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [providerId]);

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    getServicesByCategory,
    getServiceStats,
    refetch: fetchServices,
  };
};