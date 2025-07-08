// hooks/useServices.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Service = Database['public']['Tables']['services']['Row'];

export const useServices = (providerId?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        let query = supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });

        if (providerId) {
          query = query.eq('provider_id', providerId);
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message);
        } else {
          setServices(data || []);
        }
      } catch (err) {
        setError('Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [providerId]);

  const createService = async (serviceData: Database['public']['Tables']['services']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setServices(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      return { error: 'Failed to create service' };
    }
  };

  const updateService = async (serviceId: string, updates: Database['public']['Tables']['services']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setServices(prev => prev.map(service => service.id === serviceId ? data : service));
      return { data };
    } catch (err) {
      return { error: 'Failed to update service' };
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        return { error: error.message };
      }

      setServices(prev => prev.filter(service => service.id !== serviceId));
      return {};
    } catch (err) {
      return { error: 'Failed to delete service' };
    }
  };

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
  };
};