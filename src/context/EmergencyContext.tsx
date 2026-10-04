import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

type EmergencyStatus = 'idle' | 'countdown' | 'active' | 'resolved';

type EmergencyContextType = {
  status: EmergencyStatus;
  setStatus: (status: EmergencyStatus) => void;
  countdown: number;
  setCountdown: (count: number) => void;
  incidentId: string | null;
  activateSOS: (method?: string) => Promise<void>;
  cancelSOS: () => Promise<void>;
  resolveSOS: () => Promise<void>;
  recordLocation: (lat: number, lng: number, accuracy?: number, battery?: number) => Promise<void>;
  sendIncidentMessage: (msg: string) => Promise<void>;
};

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<EmergencyStatus>('idle');
  const [countdown, setCountdown] = useState(5);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const { user } = useAuth();
  const isConfigured = isSupabaseConfigured();

  const activateSOS = async (method = 'manual_button') => {
    setStatus('countdown');
    setCountdown(5);

    if (isConfigured && user) {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .insert({
            user_id: user.id,
            status: 'countdown',
            trigger_method: method
          })
          .select('id')
          .single();

        if (!error && data) {
          setIncidentId(data.id);
        }
      } catch (e) {
        console.error('Supabase incident creation error:', e);
      }
    }
  };

  const cancelSOS = async () => {
    setStatus('idle');
    if (isConfigured && incidentId) {
      try {
        await supabase
          .from('incidents')
          .update({ status: 'cancelled', resolved_at: new Date().toISOString() })
          .eq('id', incidentId);
      } catch (e) {
        console.error('Error cancelling incident:', e);
      }
    }
    setIncidentId(null);
  };

  const resolveSOS = async () => {
    setStatus('resolved');
    if (isConfigured && incidentId) {
      try {
        await supabase
          .from('incidents')
          .update({ status: 'resolved', resolved_at: new Date().toISOString() })
          .eq('id', incidentId);
      } catch (e) {
        console.error('Error resolving incident:', e);
      }
    }
  };

  const recordLocation = async (lat: number, lng: number, accuracy = 3.0, battery = 89) => {
    if (isConfigured && incidentId) {
      try {
        await supabase
          .from('incident_locations')
          .insert({
            incident_id: incidentId,
            latitude: lat,
            longitude: lng,
            accuracy_meters: accuracy,
            battery_level: battery
          });
      } catch (e) {
        console.error('Error writing location telemetry:', e);
      }
    }
  };

  const sendIncidentMessage = async (msg: string) => {
    if (isConfigured && incidentId) {
      try {
        await supabase
          .from('incident_messages')
          .insert({
            incident_id: incidentId,
            message: msg
          });
      } catch (e) {
        console.error('Error posting incident update:', e);
      }
    }
  };

  return (
    <EmergencyContext.Provider value={{
      status, setStatus,
      countdown, setCountdown,
      incidentId,
      activateSOS, cancelSOS, resolveSOS,
      recordLocation, sendIncidentMessage
    }}>
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) throw new Error('useEmergency must be used within EmergencyProvider');
  return context;
}
