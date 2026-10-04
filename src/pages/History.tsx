import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, ShieldAlert, Navigation, Calendar, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface HistoryItem {
  id: string;
  date: string;
  type: string;
  status: string;
  duration: string;
  location: string;
  trigger: string;
  responders: number;
  color: string;
  icon: typeof CheckCircle2;
}

const DEMO_HISTORY: HistoryItem[] = [
  {
    id: '#AEA-7392',
    date: 'Today, 2:30 PM',
    type: 'Medical Alert Sequence',
    status: 'Resolved',
    duration: '42 mins',
    location: '123 Main St, New York (GPS ±3m)',
    trigger: 'Manual SOS Trigger',
    responders: 2,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
  {
    id: '#AEA-7391',
    date: 'Oct 1, 2026, 9:15 AM',
    type: 'Diagnostic Test Run',
    status: 'Completed',
    duration: '2 mins',
    location: 'Home Base Address',
    trigger: 'Scheduled System Check',
    responders: 0,
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    icon: ShieldAlert,
  },
  {
    id: '#AEA-7380',
    date: 'Sep 15, 2026, 8:45 PM',
    type: 'Personal Safety Pre-alert',
    status: 'Cancelled by User',
    duration: '5 secs buffer',
    location: '4th Ave & 9th St',
    trigger: 'Accidental Trigger (Aborted)',
    responders: 0,
    color: 'text-stone-600 bg-stone-100 border-stone-200',
    icon: XCircle,
  }
];

export default function History() {
  const { user } = useAuth();
  const isConfigured = isSupabaseConfigured();
  const [history, setHistory] = useState<HistoryItem[]>(DEMO_HISTORY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadIncidents() {
      if (!isConfigured || !user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*, incident_locations(*), incident_messages(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Error fetching Supabase incidents:', error.message);
        } else if (data && data.length > 0) {
          const mapped: HistoryItem[] = data.map(item => {
            const created = new Date(item.created_at);
            const resolved = item.resolved_at ? new Date(item.resolved_at) : null;
            let durationText = 'Active Now';
            if (resolved) {
              const diffMins = Math.max(1, Math.round((resolved.getTime() - created.getTime()) / 60000));
              durationText = `${diffMins} min${diffMins > 1 ? 's' : ''}`;
            }

            const latestLoc = item.incident_locations && item.incident_locations.length > 0 
              ? `${item.incident_locations[0].latitude.toFixed(4)}°, ${item.incident_locations[0].longitude.toFixed(4)}°`
              : 'GPS Coordinates Logged';

            let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
            let icon = CheckCircle2;
            let statusText = 'Resolved';

            if (item.status === 'active' || item.status === 'countdown') {
              color = 'text-red-700 bg-red-50 border-red-200';
              icon = ShieldAlert;
              statusText = 'Active SOS';
            } else if (item.status === 'cancelled') {
              color = 'text-stone-600 bg-stone-100 border-stone-200';
              icon = XCircle;
              statusText = 'Cancelled';
            }

            return {
              id: `#AEA-${item.id.substring(0, 6).toUpperCase()}`,
              date: created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              type: item.trigger_method === 'fall_detection' ? 'Automatic Fall Alert' : 'Medical Alert Sequence',
              status: statusText,
              duration: durationText,
              location: latestLoc,
              trigger: item.trigger_method || 'Manual SOS Trigger',
              responders: item.incident_messages?.length || 0,
              color,
              icon
            };
          });
          setHistory(mapped);
        }
      } catch (err) {
        console.error('Failed to load incident history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadIncidents();
  }, [user, isConfigured]);

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 h-full">
      {/* Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-block">
              Audit Trail
            </span>
            {isConfigured ? (
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                {loading ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />} Supabase Synced
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                Local Prototype Logs
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight font-sans">
            Emergency Incident Logs
          </h2>
          <p className="text-stone-500 text-xs md:text-sm mt-1">
            Complete chronological record of all SOS transmissions and telemetry packets.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* History Items */}
      <div className="flex flex-col gap-4">
        {history.map((item, index) => (
          <div 
            key={index} 
            className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-[3px_3px_0px_0px_rgba(28,25,23,0.06)] hover:border-red-200 transition-all space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-black text-red-600 px-2.5 py-1 rounded-md bg-red-50 border border-red-100">
                  {item.id}
                </span>
                <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.date}
                </span>
              </div>
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${item.color}`}>
                ● {item.status}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">{item.type}</h3>
              <p className="text-xs text-stone-600 font-mono flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-stone-400" />
                {item.location}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="bg-[#f8f7f4] p-3 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] uppercase font-mono text-stone-500 font-bold block mb-0.5">Trigger Method</span>
                <span className="font-semibold text-stone-800 text-xs truncate block">{item.trigger}</span>
              </div>
              <div className="bg-[#f8f7f4] p-3 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] uppercase font-mono text-stone-500 font-bold block mb-0.5">Total Duration</span>
                <span className="font-semibold text-stone-800 text-xs block">{item.duration}</span>
              </div>
              <div className="bg-[#f8f7f4] p-3 rounded-2xl border border-stone-200/80 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-mono text-stone-500 font-bold block mb-0.5">Responders Notified</span>
                <span className="font-semibold text-stone-800 text-xs block">{item.responders} contacts acknowledged</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
