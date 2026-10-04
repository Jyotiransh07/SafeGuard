import { useAccessibility } from '../context/AccessibilityContext';
import { Type, Eye, MoveDiagonal, MonitorPlay, Mic, Volume2, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function Accessibility() {
  const { 
    highContrast, setHighContrast,
    largeText, setLargeText,
    reduceMotion, setReduceMotion,
    largeButtons, setLargeButtons
  } = useAccessibility();

  const settings = [
    {
      id: 'largeText',
      title: 'Large Typography',
      desc: 'Increase interface font scale globally for easier reading.',
      icon: Type,
      state: largeText,
      setter: setLargeText
    },
    {
      id: 'highContrast',
      title: 'High Contrast Mode',
      desc: 'Increase contrast ratio to WCAG AAA standards for low vision.',
      icon: Eye,
      state: highContrast,
      setter: setHighContrast
    },
    {
      id: 'largeButtons',
      title: 'Expanded Tap Zones',
      desc: 'Enlarge hit targets on all emergency triggers and interactive controls.',
      icon: MoveDiagonal,
      state: largeButtons,
      setter: setLargeButtons
    },
    {
      id: 'reduceMotion',
      title: 'Reduced Motion',
      desc: 'Disable non-essential canvas oscillations and decorative animations.',
      icon: MonitorPlay,
      state: reduceMotion,
      setter: setReduceMotion
    }
  ];

  const features = [
    {
      title: 'Voice Emergency Trigger',
      desc: 'Enables hotword "Help Me" or "Activate SOS" voice detection.',
      icon: Mic,
      status: 'Active (Demo)'
    },
    {
      title: 'Speech Synthesis Readout',
      desc: 'Audibly broadcasts dispatch countdown and contact acknowledgments.',
      icon: Volume2,
      status: 'Enabled'
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block mb-1">
            Universal Design
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight font-sans">
            Accessibility & Assistance
          </h2>
          <p className="text-stone-500 text-xs md:text-sm mt-1">
            Tailor the emergency application interface to match your accessibility requirements.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
          <HeartHandshake className="w-6 h-6" />
        </div>
      </div>

      {/* Visual Preferences */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)]">
        <div className="p-4 md:px-6 bg-[#f8f7f4] border-b border-stone-200/80 font-bold text-stone-800 text-sm flex items-center justify-between">
          <span>Visual & Physical Controls</span>
          <span className="text-xs font-mono font-normal text-stone-500">WCAG Compliant</span>
        </div>
        <div className="divide-y divide-stone-100">
          {settings.map((setting) => (
            <div key={setting.id} className="p-5 md:px-6 flex items-center justify-between gap-4">
              <div className="flex gap-4 items-start">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  setting.state 
                    ? 'bg-red-50 text-red-600 border-red-200' 
                    : 'bg-[#f8f7f4] text-stone-600 border-stone-200'
                }`}>
                  <setting.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{setting.title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-snug">{setting.desc}</p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button 
                onClick={() => setting.setter(!setting.state)}
                className={`w-13 h-7 rounded-full relative shrink-0 transition-colors cursor-pointer border ${
                  setting.state ? 'bg-red-600 border-red-700' : 'bg-stone-200 border-stone-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  setting.state ? 'translate-x-6.5' : 'translate-x-0.5'
                } shadow-sm`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Assistive Capabilities */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)]">
        <div className="p-4 md:px-6 bg-[#f8f7f4] border-b border-stone-200/80 font-bold text-stone-800 text-sm">
          Speech & Audio Protocols
        </div>
        <div className="divide-y divide-stone-100">
          {features.map((feature, i) => (
            <div key={i} className="p-5 md:px-6 flex items-center justify-between gap-4">
              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-2xl bg-[#f8f7f4] border border-stone-200 text-stone-700 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{feature.title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-snug">{feature.desc}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {feature.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
