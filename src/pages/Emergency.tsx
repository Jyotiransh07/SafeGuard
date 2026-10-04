import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { ShieldAlert, X, AlertTriangle, Send, MapPin, CheckCircle2, MessageSquare, Activity, Radio } from 'lucide-react';

export default function Emergency() {
  const navigate = useNavigate();
  const { status, setStatus, countdown, setCountdown, cancelSOS, resolveSOS, sendIncidentMessage } = useEmergency();
  const [timelineStep, setTimelineStep] = useState(0);
  const [customMsg, setCustomMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // If we arrive here but status is idle, redirect to dashboard
  useEffect(() => {
    if (status === 'idle') {
      navigate('/dashboard');
    }
  }, [status, navigate]);

  // Countdown logic
  useEffect(() => {
    if (status === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'countdown' && countdown === 0) {
      setStatus('active');
    }
  }, [status, countdown, setCountdown, setStatus]);

  // Timeline progression for active state
  useEffect(() => {
    if (status === 'active' && timelineStep < 4) {
      const timer = setTimeout(() => {
        setTimelineStep(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [status, timelineStep]);

  const handleSendMessage = (msg?: string) => {
    const textToSend = msg || customMsg;
    if (!textToSend.trim()) return;
    sendIncidentMessage(textToSend);
    setCustomMsg('');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleCancel = () => {
    cancelSOS();
    navigate('/dashboard');
  };

  const handleResolve = () => {
    resolveSOS();
    navigate('/dashboard');
  };

  const handleSendNow = () => {
    setCountdown(0);
    setStatus('active');
  };

  const predefinedMessages = [
    "I need immediate medical assistance.",
    "I may be in danger. Please track my location.",
    "I am having a medical emergency.",
    "I cannot speak right now. Please call authorities."
  ];

  if (status === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[72vh] animate-in zoom-in duration-300">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(220,38,38,0.12)] border-2 border-red-200 flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Top Progress Track */}
          <div className="absolute top-0 left-0 w-full h-2.5 bg-stone-100">
            <div 
              className="h-full bg-red-600 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>

          <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-5 shadow-inner">
            <AlertTriangle className="w-10 h-10 animate-bounce" />
          </div>
          
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
            Safety Delay Window
          </span>

          <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-1 font-sans">Emergency Alert</h2>
          <p className="text-stone-500 font-medium text-sm mb-6">Dispatch sequence engaging in...</p>
          
          <div className="text-8xl font-black text-red-600 mb-8 tabular-nums tracking-tighter font-mono">
            {countdown}
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
            <button 
              onClick={handleCancel}
              className="py-3.5 px-4 rounded-2xl font-bold text-sm bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
              CANCEL
            </button>
            <button 
              onClick={handleSendNow}
              className="py-3.5 px-4 rounded-2xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              DISPATCH NOW
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Active Emergency Banner */}
      <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 md:p-8 text-white shadow-[6px_6px_0px_0px_rgba(28,25,23,0.12)] border border-red-700 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 opacity-10">
          <ShieldAlert className="w-56 h-56" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-100"></span>
            </span>
            <span className="font-mono font-bold tracking-widest uppercase text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
              EMERGENCY BROADCAST ACTIVE
            </span>
          </div>
          
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Help is being dispatched</h2>
            <p className="text-red-100 text-xs md:text-sm mt-1">High-priority distress packet relayed to emergency circle and authorities.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono font-medium bg-black/20 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-200 shrink-0" />
              <span className="truncate">GPS: 34.0522° N, 118.2437° W (± 3m)</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Packet ID: #AEA-2026-SOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Status Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)]">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
          <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2 font-sans">
            <Activity className="w-5 h-5 text-red-600" />
            Dispatch Telemetry Log
          </h3>
          <span className="text-[11px] font-mono text-stone-500 font-bold uppercase tracking-wider">
            Step {Math.min(timelineStep + 1, 5)} of 5
          </span>
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'Alert packet formulated & signed', time: '0s' },
            { label: 'Satellite GPS fix obtained & verified', time: '+1s' },
            { label: 'Emergency medical profile attached', time: '+1.5s' },
            { label: 'Emergency circle contacts notified via SMS & Call', time: '+2s' },
            { label: 'Live responder telemetry beacon broadcast', time: '+3s' },
          ].map((step, i) => {
            const isCompleted = timelineStep >= i;
            return (
              <div 
                key={i} 
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isCompleted 
                    ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950' 
                    : 'bg-[#f8f7f4] border-stone-200/70 text-stone-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isCompleted ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-sm font-semibold">{step.label}</span>
                </div>
                <span className="text-xs font-mono text-stone-500">{step.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Predefined Communication */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)]">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-lg text-stone-900 font-sans">Quick Status Updates</h3>
        </div>
        <p className="text-xs text-stone-500 mb-4">Send instant updates without typing to emergency contacts.</p>
        
        <div className="grid gap-2.5">
          {predefinedMessages.map((msg, i) => (
            <button 
              key={i} 
              onClick={() => handleSendMessage(msg)}
              className="text-left w-full p-3.5 rounded-2xl bg-[#f8f7f4] hover:bg-stone-100 hover:border-red-300 border border-stone-200/80 transition-all font-semibold text-sm text-stone-800 flex justify-between items-center group cursor-pointer"
            >
              <span>{msg}</span>
              <Send className="w-4 h-4 text-stone-400 group-hover:text-red-600 transition-colors" />
            </button>
          ))}
        </div>
        
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="Send custom note to contacts..."
              className="flex-1 bg-[#f8f7f4] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
            <button 
              onClick={() => handleSendMessage()}
              className="bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-5 text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
              disabled={!customMsg.trim()}
            >
              Send
            </button>
          </div>
          {showToast && (
            <p className="text-emerald-700 text-xs font-bold font-mono mt-3 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Message broadcasted to emergency circle
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button 
          onClick={handleResolve}
          className="px-8 py-3.5 rounded-2xl text-stone-700 font-bold text-sm bg-white hover:bg-red-50 hover:text-red-700 border border-stone-200 shadow-sm transition-all cursor-pointer"
        >
          Cancel & Resolve Emergency Alert
        </button>
      </div>
    </div>
  );
}
