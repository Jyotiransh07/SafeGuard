import { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Settings as SettingsIcon, Clock, Trash2, LogOut, Smartphone, VolumeX, Activity, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { countdown, setCountdown } = useEmergency();
  const { user, signOut } = useAuth();
  const isConfigured = isSupabaseConfigured();
  const navigate = useNavigate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toggles, setToggles] = useState({ fallDetection: true, silentMode: false, haptics: true });

  // Load user settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      if (!isConfigured || !user) return;
      try {
        const { data } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          if (data.countdown_seconds !== undefined) setCountdown(data.countdown_seconds);
          setToggles({
            fallDetection: data.fall_detection ?? true,
            silentMode: data.silent_mode ?? false,
            haptics: true
          });
        }
      } catch (err) {
        console.error('Error loading Supabase user settings:', err);
      }
    }

    loadSettings();
  }, [user, isConfigured]);

  const toggleSetting = async (key: 'fallDetection' | 'silentMode' | 'haptics') => {
    const nextVal = !toggles[key];
    const newToggles = { ...toggles, [key]: nextVal };
    setToggles(newToggles);

    if (isConfigured && user) {
      try {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            countdown_seconds: countdown,
            fall_detection: newToggles.fallDetection,
            silent_mode: newToggles.silentMode,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Error saving user setting to Supabase:', err);
      }
    }
  };

  const handleCountdownChange = async (val: number) => {
    setCountdown(val);
    if (isConfigured && user) {
      try {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            countdown_seconds: val,
            fall_detection: toggles.fallDetection,
            silent_mode: toggles.silentMode,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Error updating countdown in Supabase:', err);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 h-full">
      {/* Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-block">
              System Configuration
            </span>
            {isConfigured ? (
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Supabase Synced
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                Local Prototype Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight font-sans">
            Safety & Application Settings
          </h2>
          <p className="text-stone-500 text-xs md:text-sm mt-1">
            Configure emergency countdown thresholds, sensor triggers, and privacy controls.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
          <SettingsIcon className="w-6 h-6" />
        </div>
      </div>

      {/* Emergency Countdown Config */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
          <Clock className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-stone-900 text-base font-sans">Emergency Delay Window</h3>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          Configurable buffer window to abort accidental presses before emergency packets are permanently broadcasted.
        </p>
        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {[0, 3, 5, 10].map((val) => (
            <button
              key={val}
              onClick={() => handleCountdownChange(val)}
              className={`py-3 rounded-2xl font-mono font-bold text-sm transition-all border cursor-pointer ${
                countdown === val 
                  ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/25' 
                  : 'bg-[#f8f7f4] text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {val === 0 ? '0s (Instant)' : `${val} Seconds`}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Sensors */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)]">
        <div className="p-4 md:px-6 bg-[#f8f7f4] border-b border-stone-200/80 font-bold text-stone-800 text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Telemetry & Device Sensor Automation</span>
        </div>
        <div className="divide-y divide-stone-100">
          <div className="p-5 md:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-stone-900 text-sm">Fall Impact Detection</p>
                <p className="text-xs text-stone-500">Auto-triggers countdown upon sudden deceleration shock</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('fallDetection')}
              className={`w-13 h-7 rounded-full relative shrink-0 transition-colors cursor-pointer border ${
                toggles.fallDetection ? 'bg-red-600 border-red-700' : 'bg-stone-200 border-stone-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                toggles.fallDetection ? 'translate-x-6.5' : 'translate-x-0.5'
              } shadow-sm`} />
            </button>
          </div>
          
          <div className="p-5 md:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#f8f7f4] border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                <VolumeX className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-stone-900 text-sm">Silent SOS Mode</p>
                <p className="text-xs text-stone-500">Mutes siren and screen flashes for covert dispatch</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('silentMode')}
              className={`w-13 h-7 rounded-full relative shrink-0 transition-colors cursor-pointer border ${
                toggles.silentMode ? 'bg-red-600 border-red-700' : 'bg-stone-200 border-stone-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                toggles.silentMode ? 'translate-x-6.5' : 'translate-x-0.5'
              } shadow-sm`} />
            </button>
          </div>
        </div>
      </div>

      {/* Account & Profile Link */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] divide-y divide-stone-100">
        <button 
          onClick={() => navigate('/profile')}
          className="w-full flex items-center justify-between p-5 md:px-6 hover:bg-[#f8f7f4] transition-colors text-left cursor-pointer"
        >
          <div>
            <p className="font-bold text-stone-900 text-sm">Emergency Medical Profile</p>
            <p className="text-xs text-stone-500">Blood group, allergies, medications, and directives</p>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </button>

        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-5 md:px-6 hover:bg-[#f8f7f4] transition-colors text-left font-bold text-stone-700 text-sm cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-stone-500" />
          <span>Sign Out Session</span>
        </button>
        
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-3 p-5 md:px-6 hover:bg-red-50 transition-colors text-left font-bold text-red-600 text-sm cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset All Emergency Data</span>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-center text-stone-900 font-sans">Reset Application?</h3>
            <p className="text-stone-500 text-xs text-center leading-relaxed">
              This will restore prototype defaults, wiping local medical records and customized contacts.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl text-sm hover:bg-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  navigate('/login');
                }}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 shadow-md shadow-red-600/30 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
