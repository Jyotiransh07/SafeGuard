import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

type EmergencyStatus = 'idle' | 'countdown' | 'active' | 'resolved';

export interface DispatchedContact {
  name: string;
  phone: string;
  waLink: string;
  smsLink: string;
}

type EmergencyContextType = {
  status: EmergencyStatus;
  setStatus: (status: EmergencyStatus) => void;
  countdown: number;
  setCountdown: (count: number) => void;
  incidentId: string | null;
  dispatchedContacts: DispatchedContact[];
  activateSOS: (method?: string) => Promise<void>;
  cancelSOS: () => Promise<void>;
  resolveSOS: () => Promise<void>;
  recordLocation: (lat: number, lng: number, accuracy?: number, battery?: number) => Promise<void>;
  sendIncidentMessage: (msg: string) => Promise<void>;
};

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

// Build the WhatsApp & SMS SOS message for a given contact
function buildSOSMessage(contactName: string, userFullName: string, lat?: number, lng?: number): string {
  const location = lat != null && lng != null
    ? `📍 Live location: https://maps.google.com/?q=${lat},${lng}`
    : '📍 Location: being acquired...';
  return (
    `🚨 EMERGENCY ALERT from ${userFullName}\n\n` +
    `Hi ${contactName}, this is an automated SOS alert.\n` +
    `${userFullName} needs IMMEDIATE assistance.\n\n` +
    `${location}\n\n` +
    `Please call or go to their location immediately.\n` +
    `— AEA SafeGuard Pro`
  );
}

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<EmergencyStatus>('idle');
  const [countdown, setCountdown] = useState(5);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [dispatchedContacts, setDispatchedContacts] = useState<DispatchedContact[]>([]);
  const { user } = useAuth();
  const isConfigured = isSupabaseConfigured();

  // Fetch the user's display name from auth metadata or profile
  const getUserName = (): string => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name as string;
    if (user?.email) return user.email.split('@')[0];
    return 'An AEA User';
  };

  // Fetch contacts and fire WhatsApp / SMS SOS links
  const dispatchToContacts = async (lat?: number, lng?: number) => {
    let contacts: { name: string; phone: string }[] = [];
    const userName = getUserName();

    if (isConfigured && user) {
      try {
        const { data } = await supabase
          .from('emergency_contacts')
          .select('name, phone')
          .eq('user_id', user.id)
          .order('priority', { ascending: true });
        if (data && data.length > 0) {
          contacts = data;
        }
      } catch (e) {
        console.error('Error fetching contacts for dispatch:', e);
      }
    }

    if (contacts.length === 0) {
      // Demo fallback
      contacts = [
        { name: 'Primary Contact', phone: '+15550192831' },
      ];
    }

    const dispatched: DispatchedContact[] = contacts.map(c => {
      // Strip spaces/dashes/brackets for URL encoding
      const cleanPhone = c.phone.replace(/[\s\-()]/g, '');
      const msg = buildSOSMessage(c.name, userName, lat, lng);
      const encodedMsg = encodeURIComponent(msg);
      return {
        name: c.name,
        phone: c.phone,
        waLink: `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedMsg}`,
        smsLink: `sms:${cleanPhone}?body=${encodedMsg}`,
      };
    });

    setDispatchedContacts(dispatched);

    // Auto-open WhatsApp for each contact with a small delay between them
    // (browser tab opening — works best on desktop; on mobile it deep-links to WhatsApp)
    dispatched.forEach((c, idx) => {
      setTimeout(() => {
        window.open(c.waLink, '_blank', 'noopener,noreferrer');
      }, idx * 1200); // stagger so browser doesn't block multiple popups
    });
  };

  const activateSOS = async (method = 'manual_button') => {
    setStatus('countdown');
    setCountdown(5);
    setDispatchedContacts([]);

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

  // Called when countdown hits 0 — dispatches contacts
  const triggerActiveDispatch = async () => {
    setStatus('active');

    // Try to get current GPS before messaging
    let lat: number | undefined;
    let lng: number | undefined;

    if ('geolocation' in navigator) {
      try {
        await new Promise<void>(resolve => {
          navigator.geolocation.getCurrentPosition(
            pos => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              resolve();
            },
            () => resolve(), // proceed without GPS if denied
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        });
      } catch {
        // ignore
      }
    }

    // Write GPS telemetry to DB if available
    if (lat != null && lng != null && isConfigured && incidentId) {
      try {
        await supabase.from('incident_locations').insert({
          incident_id: incidentId,
          latitude: lat,
          longitude: lng,
          accuracy_meters: 5.0,
        });
      } catch (e) {
        console.error('Error writing auto GPS telemetry:', e);
      }
    }

    // Update incident status to active in DB
    if (isConfigured && incidentId) {
      try {
        await supabase
          .from('incidents')
          .update({ status: 'active' })
          .eq('id', incidentId);
      } catch (e) {
        console.error('Error updating incident to active:', e);
      }
    }

    // Dispatch WhatsApp + SMS links to all contacts
    await dispatchToContacts(lat, lng);
  };

  const cancelSOS = async () => {
    setStatus('idle');
    setDispatchedContacts([]);
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
    setDispatchedContacts([]);
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
        await supabase.from('incident_locations').insert({
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
        await supabase.from('incident_messages').insert({
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
      status, setStatus: (s) => {
        // Intercept 'active' state transition to fire dispatch
        if (s === 'active') {
          triggerActiveDispatch();
        } else {
          setStatus(s);
        }
      },
      countdown, setCountdown,
      incidentId,
      dispatchedContacts,
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
