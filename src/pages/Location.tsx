import { useState, useEffect } from 'react';
import { RefreshCw, Share2, Radio, Navigation, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons broken by Vite bundling
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom red SOS marker
const sosIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width: 36px; height: 36px; border-radius: 50%;
    background: #DC2626; border: 3px solid white;
    box-shadow: 0 0 0 3px #DC2626, 0 4px 12px rgba(220,38,38,0.5);
    display: flex; align-items: center; justify-content: center;
    animation: sosPulse 1.5s ease-in-out infinite;
  ">
    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
      <path d="M12 2L2 20h20L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
    </svg>
  </div>
  <style>
    @keyframes sosPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
  </style>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
});

// Helper: smoothly re-center map when position changes
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function LocationPage() {
  const { recordLocation, incidentId } = useEmergency();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  const fetchLocation = () => {
    setLoading(true);
    setGeoError(null);

    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        setPosition([lat, lng]);
        setAccuracy(acc);
        setLoading(false);
        setGeoError(null);

        // If incident is active, record location to Supabase
        if (incidentId && isConfigured) {
          await recordLocation(lat, lng, acc);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Please allow location access in your browser settings and try again.');
        } else if (err.code === err.TIMEOUT) {
          setGeoError('GPS lock timed out. Please try again or move to an open area.');
        } else {
          setGeoError('Unable to acquire location. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setIsSharing(true);
        alert('Emergency location link copied to clipboard!');
      } catch {
        alert(`Copy this link: ${url}`);
      }
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
      <div className="flex-1 min-h-[380px] bg-white rounded-3xl overflow-hidden relative border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)]">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-3">
            <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
            <span className="text-xs font-mono font-bold text-stone-600">Locking satellite GPS...</span>
          </div>
        )}

        {/* Geolocation error state */}
        {!loading && geoError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#f8f7f4] gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-stone-900 text-sm mb-1">Location Access Required</p>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">{geoError}</p>
            </div>
            <button
              onClick={fetchLocation}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* OpenStreetMap via react-leaflet — works on all domains, no API key */}
        {!loading && !geoError && position && (
          <MapContainer
            center={position}
            zoom={16}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, height: '100%', width: '100%' }}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapRecenter lat={position[0]} lng={position[1]} />
            <Marker position={position} icon={sosIcon}>
              <Popup>
                <div className="text-xs font-mono font-bold text-red-700">
                  📍 Your Location<br />
                  {position[0].toFixed(5)}°, {position[1].toFixed(5)}°<br />
                  Accuracy: ±{accuracy ? Math.round(accuracy) : '?'}m
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}

        {/* Floating Telemetry Stamp */}
        {position && !loading && !geoError && (
          <div className="absolute top-4 left-4 z-[500] bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200/80 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-stone-700">
              {position[0].toFixed(4)}°, {position[1].toFixed(4)}°
            </span>
          </div>
        )}
      </div>

      {/* Details & Controls Card */}
      {position && !geoError && (
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
