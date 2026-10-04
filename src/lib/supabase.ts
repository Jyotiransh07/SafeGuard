import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Sanitize URL: strip trailing slash or accidental /rest/v1 copy
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseUrl.startsWith('https://')
  );
};

// Safe fallback client to prevent runtime crashes if keys are not yet configured
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key'
);

export type Profile = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
};

export type MedicalCard = {
  id?: string;
  user_id: string;
  blood_group: string;
  age: number;
  organ_donor: boolean;
  allergies: string[];
  medical_conditions: string;
  paramedic_instructions: string;
};

export type EmergencyContact = {
  id?: string;
  user_id?: string;
  name: string;
  relation: string;
  phone: string;
  priority: number;
  methods: string[];
  created_at?: string;
};

export type Incident = {
  id?: string;
  user_id?: string;
  status: 'countdown' | 'active' | 'resolved' | 'cancelled';
  trigger_method: string;
  share_token?: string;
  created_at?: string;
  resolved_at?: string;
};
