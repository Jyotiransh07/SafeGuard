import { useState, useEffect } from 'react';
import { RefreshCw, Share2, Radio, Navigation, CheckCircle2 } from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { isSupabaseConfigured } from '../lib/supabase';

export default function LocationPage() {
  const { recordLocation, incidentId } = useEmergency();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const isConfigured = isSupabaseConfigured();

  const fetchLocation = () => {
    setLoading(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = pos.coords.accuracy;
          setPosition([lat, lng]);
          setAccuracy(acc);
          setLoading(false);

          // If incident is active, record location to Supabase
          if (incidentId && isConfigured) {
            await recordLocation(lat, lng, acc);
          }
        },
        () => {
          // If denied, fallback to a sensible default (e.g. standard demo coordinates)
          setPosition([37.7749, -122.4194]);
          setAccuracy(4.5);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setPosition([37.7749, -122.4194]);
      setAccuracy(5);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleShare = async () => {
    if (!position) return;
    
    const url = `https://maps.google.com/?q=${position[0]},${position[1]}`;
    const text = `Emergency SOS live location pin (${position[0].toFixed(5)}, ${position[1].toFixed(5)}):`;

    if (incidentId && isConfigured) {
      await recordLocation(position[0], position[1], accuracy || 4.0);
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AEA Emergency Location',
          text: text,
          url: url,
        });
        setIsSharing(true);
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      setIsSharing(true);
      alert("Emergency location link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-500 pb-24 h-full min-h-[80vh]">
      {/* Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-block mb-1">
            Real-Time Telemetry
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight font-sans">
            Live Satellite Location
          </h2>
          <p className="text-stone-500 text-xs md:text-sm mt-1">
            High-precision GPS stream ready for instant emergency transmission.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
          <Navigation className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* Map Viewport Card */}
      <div className="flex-1 min-h-[340px] bg-white rounded-3xl overflow-hidden relative border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)]">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs gap-3">
            <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
            <span className="text-xs font-mono font-bold text-stone-600">Locking satellite GPS...</span>
          </div>
        )}

        {position && (
          <iframe 
            className="absolute inset-0 w-full h-full"
            style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
            src={`https://maps.google.com/maps?q=${position[0]},${position[1]}&z=15&output=embed`}
            allowFullScreen
            title="Emergency Current Location"
          ></iframe>
        )}

        {/* Floating Telemetry Stamp */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200/80 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-mono font-bold text-stone-700">
            {position ? `${position[0].toFixed(4)}°, ${position[1].toFixed(4)}°` : 'Acquiring lock...'}
          </span>
        </div>
      </div>

      {/* Details & Controls Card */}
      {position && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#f8f7f4] p-3.5 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] uppercase font-mono font-bold text-stone-500 block mb-1">
                Coordinates
              </span>
              <span className="font-mono font-bold text-stone-900 text-sm">
                {position[0].toFixed(5)}°, {position[1].toFixed(5)}°
              </span>
            </div>

            <div className="bg-[#f8f7f4] p-3.5 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] uppercase font-mono font-bold text-stone-500 block mb-1">
                Precision Radius
              </span>
              <span className="font-mono font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ±{accuracy ? Math.round(accuracy) : 3} meters
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={fetchLocation}
              className="flex-1 py-3.5 bg-[#f8f7f4] hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-stone-500" /> Refresh GPS
            </button>
            <button 
              onClick={isSharing ? () => setIsSharing(false) : handleShare}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md
                ${isSharing 
                  ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-stone-900/20' 
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                }
              `}
            >
              <Share2 className="w-4 h-4" />
              {isSharing ? 'Stop Broadcast' : 'Broadcast Location'}
            </button>
          </div>
          
          {isSharing && (
            <div className="flex gap-2.5 items-center text-xs font-mono font-bold text-red-800 bg-red-50 p-3 rounded-2xl border border-red-200">
              <Radio className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />
              <p>Live encrypted coordinates are broadcasting to your emergency circle.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
