import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { ShieldAlert, Activity, Users, MapPin, Battery, Wifi, AlertCircle, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { activateSOS } = useEmergency();
  const [isPressing, setIsPressing] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSOSClick = () => {
    setIsPressing(true);
    setTimeout(() => {
      activateSOS();
      navigate('/emergency');
    }, 150);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24 h-full">
      {/* Header Info */}
      <div className="flex justify-between items-center px-1 pt-1">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-block mb-1">
            AEA Monitoring Active
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight font-sans">
            Safety Command Center
          </h1>
          <p className="text-stone-500 font-medium text-xs md:text-sm">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • All emergency telemetry nominal
          </p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-stone-200 p-1 flex items-center justify-center">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full rounded-xl" />
        </div>
      </div>

      {/* Main Status & Quick Stats */}
      <div className="bg-white rounded-3xl overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] border border-stone-200/90">
        <div className="p-6 relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
            <Activity className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM ARMED & MONITORING
          </div>
          <p className="text-stone-500 text-xs md:text-sm max-w-sm mb-6">
            Background telemetry active. One-tap trigger routes to configured circle with priority packet relay.
          </p>
          
          <div className="w-full grid grid-cols-3 gap-3">
            <div className="bg-[#f8f7f4] rounded-2xl p-3 border border-stone-200/80 flex flex-col items-center justify-center shadow-xs">
              <Battery className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="font-extrabold text-stone-900 text-sm">89%</span>
              <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">Battery</span>
            </div>
            <div className="bg-[#f8f7f4] rounded-2xl p-3 border border-stone-200/80 flex flex-col items-center justify-center shadow-xs">
              <Wifi className="w-5 h-5 text-blue-600 mb-1" />
              <span className="font-extrabold text-stone-900 text-sm">Strong</span>
              <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">Network</span>
            </div>
            <div className="bg-[#f8f7f4] rounded-2xl p-3 border border-stone-200/80 flex flex-col items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5 text-red-600 mb-1" />
              <span className="font-extrabold text-stone-900 text-sm">Active</span>
              <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">GPS Lock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary SOS Action */}
      <div className="flex flex-col items-center justify-center py-6 relative w-full">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full border-2 border-red-200 animate-ping" style={{ animationDuration: '2.5s' }}></div>
          <div className="w-80 h-80 rounded-full border border-red-100 absolute animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.8s' }}></div>
        </div>

        <button
          onClick={handleSOSClick}
          className={`
            relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center text-white
            transition-all duration-300 select-none border-[8px] border-white cursor-pointer
            ${isPressing ? 'scale-95 shadow-[0_0_40px_rgba(220,38,38,0.5)] bg-red-700' : 'bg-gradient-to-br from-red-600 to-rose-600 hover:scale-105 shadow-[0_20px_50px_rgba(220,38,38,0.35)] hover:shadow-[0_25px_60px_rgba(220,38,38,0.5)]'}
          `}
        >
          <div className="absolute inset-2 rounded-full border border-white/30"></div>
          <ShieldAlert className={`w-14 h-14 mb-2 drop-shadow-md ${isPressing ? 'animate-bounce' : ''}`} strokeWidth={2.5} />
          <span className="text-3xl font-black tracking-widest drop-shadow-md">SOS</span>
        </button>
        
        <p className="mt-6 text-stone-500 font-bold text-xs text-center tracking-widest uppercase font-mono">
          Tap for immediate emergency dispatch
        </p>
      </div>

      {/* Informative Section: Quick Nav & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div 
          onClick={() => navigate('/contacts')}
          className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-[3px_3px_0px_0px_rgba(28,25,23,0.06)] flex items-center justify-between cursor-pointer hover:border-red-300 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Trusted Contacts</h3>
              <p className="text-xs text-stone-500 font-medium">3 active responders ready to alert</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </div>

        <div 
          onClick={() => navigate('/location')}
          className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-[3px_3px_0px_0px_rgba(28,25,23,0.06)] flex items-center justify-between cursor-pointer hover:border-red-300 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Live Map Location</h3>
              <p className="text-xs text-stone-500 font-medium">Accurate to 3.2m • Real-time stream</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </div>

        <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-5 border border-amber-200/70 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-sm mb-1">Safety Advisory</h3>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Your location is encrypted and only shared when an emergency alert is triggered. Keep your battery above 20% to maintain continuous high-frequency satellite telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
