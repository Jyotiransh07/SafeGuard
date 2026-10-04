import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Navigation, 
  Accessibility, 
  Users, 
  ArrowRight, 
  Activity, 
  MapPin, 
  Bell, 
  Radio, 
  HeartHandshake, 
  CheckCircle2
} from 'lucide-react';
import { GalleryHeading } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 selection:bg-red-500 selection:text-white relative overflow-x-hidden">
      {/* Decorative Subtle Paper Texture Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#f8f7f4]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <nav className="flex justify-between items-center py-4 px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-stone-900 font-sans block leading-none">AEA</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">SafeGuard Pro</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#threeui-hero" className="hover:text-red-600 transition-colors">Emergency Shader</a>
            <a href="#features" className="hover:text-red-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-red-600 transition-colors">How It Works</a>
            <a href="#accessibility" className="hover:text-red-600 transition-colors">Accessibility</a>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-stone-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow hover:-translate-y-0.5"
            >
              Launch Demo
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section with ThreeUI GalleryHeading */}
      <section id="threeui-hero" className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        {/* Top Tagline / Status pill */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            24/7 ASSISTIVE EMERGENCY DISPATCH SYSTEM
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-stone-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              STATUS: READY
            </span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              CANVAS 2D: RISO SWEEP
            </span>
          </div>
        </div>

        {/* The Exact Configured ThreeUI Component in shader-frame */}
        <div className="relative w-full">
          <div className="shader-frame relative w-full h-[420px] sm:h-[500px] md:h-[580px] overflow-hidden bg-[#f8f7f4]">
            <GalleryHeading
              variant="horizontal-sweep"
              mode="light"
              font="oldstyle"
              weight="700"
              headlineSize={1.40}
              hue={0}
              saturation={1.00}
              brightness={1.00}
            />
          </div>

          {/* Interactive Hint */}
          <div className="flex justify-end mt-1.5 pr-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Hover pointer to accelerate orbit speed
            </span>
          </div>
        </div>

        {/* Hero Actions Bar */}
        <div className="mt-8 p-6 md:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 font-sans">
              Immediate Assistance at the Touch of a Button
            </h2>
            <p className="text-stone-600 text-sm md:text-base leading-relaxed">
              Equipped with instant emergency SOS broadcasting, live GPS telemetry, automated trusted contact alerts, and accessibility-first controls.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Link 
              to="/emergency" 
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5"
            >
              <ShieldAlert className="w-5 h-5" />
              TRIGGER SOS ALERT
            </Link>
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-[#f8f7f4] hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4 text-stone-500" />
            </Link>
          </div>
        </div>

        {/* Rapid Stat Strip */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Dispatch Latency', val: '< 250 ms', desc: 'Instant packet relay' },
            { label: 'GPS Precision', val: '± 3.2 m', desc: 'High-accuracy lock' },
            { label: 'Trusted Contacts', val: 'Instant SMS', desc: 'Automated broadcast' },
            { label: 'Accessibility Mode', val: 'WCAG AAA', desc: 'High-contrast & audio' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/70 border border-stone-200/80 text-center sm:text-left">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-bold block">{stat.label}</span>
              <span className="text-xl md:text-2xl font-black text-stone-900 mt-0.5 block">{stat.val}</span>
              <span className="text-xs text-stone-500 mt-0.5 block">{stat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-stone-100/60 border-t border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
              Safety Architecture
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              Built for Moments When Seconds Count
            </h2>
            <p className="text-stone-600 text-base md:text-lg">
              Every interface element is calibrated for rapid accessibility, high-contrast visibility, and foolproof execution.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldAlert,
                color: 'text-red-600',
                badge: 'Primary Protocol',
                title: 'One-Tap SOS',
                desc: 'Instantly fires an emergency beacon with a cancellation safety buffer to prevent false alarms.'
              },
              {
                icon: Navigation,
                color: 'text-blue-600',
                badge: 'Real-Time Telemetry',
                title: 'Live Location Tracking',
                desc: 'Broadcasts accurate real-time GPS coordinates directly to trusted emergency responders and family.'
              },
              {
                icon: Accessibility,
                color: 'text-emerald-600',
                badge: 'Inclusive Design',
                title: 'Adaptive Interface',
                desc: 'Customizable typography, high-contrast mode, reduced motion, and large tap targets for impaired mobility.'
              },
              {
                icon: Users,
                color: 'text-purple-600',
                badge: 'Automated Circle',
                title: 'Emergency Circle',
                desc: 'Pre-configured trusted contacts receiving immediate SMS notifications, battery level, and location pins.'
              }
            ].map((f, i) => (
              <div 
                key={i} 
                className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-[3px_3px_0px_0px_rgba(28,25,23,0.06)] hover:shadow-[5px_5px_0px_0px_rgba(220,38,38,0.2)] hover:border-red-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center">
                      <f.icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <span className="text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded-md bg-stone-100 text-stone-600">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mb-2">{f.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center text-xs font-semibold text-stone-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                  Verified Active
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full bg-stone-200/80 text-stone-800 text-xs font-bold uppercase tracking-wider">
            Operational Workflow
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            How The Emergency System Operates
          </h2>
          <p className="text-stone-600 text-base">
            From the initial trigger to responder arrival, every step is choreographed automatically.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Trigger Beacon',
              desc: 'Tap the emergency SOS button on mobile or desktop to initiate the alert sequence.',
              icon: ShieldAlert,
              tag: '1-Click'
            },
            {
              step: '02',
              title: 'Safety Countdown',
              desc: 'A 5-second audiovisual timer provides an instant abort window to prevent accidental triggers.',
              icon: Activity,
              tag: '5s Safety'
            },
            {
              step: '03',
              title: 'Telemetry Lock',
              desc: 'High-precision GPS coordinates, battery level, and user medical card are assembled into a packet.',
              icon: MapPin,
              tag: 'Encrypted'
            },
            {
              step: '04',
              title: 'Multi-Channel Alert',
              desc: 'Simultaneous alerts broadcast to nominated contacts with instant navigation links.',
              icon: Bell,
              tag: 'Instant'
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-[3px_3px_0px_0px_rgba(28,25,23,0.06)] relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-red-600">{item.step}</span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                    {item.tag}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accessibility Callout */}
      <section id="accessibility" className="py-16 bg-[#ffffff] border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="p-8 md:p-12 rounded-3xl bg-[#f8f7f4] border border-stone-200/90 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <HeartHandshake className="w-4 h-4" />
                ACCESSIBILITY FOR ALL USERS
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
                Designed for Persons with Disabilities & Elderly Citizens
              </h3>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                AEA incorporates high-contrast mode, speech synthesis for alerts, customizable text sizing, and high-visibility hit zones so that everyone can signal for emergency help regardless of physical limitations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Link 
                to="/accessibility" 
                className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold text-sm transition-all text-center"
              >
                Customize Accessibility
              </Link>
              <Link 
                to="/dashboard" 
                className="px-6 py-3.5 bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 rounded-xl font-semibold text-sm transition-all text-center"
              >
                Test in Live Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-14 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">AEA SafeGuard Pro</span>
              <p className="text-xs text-stone-400">Assistive Emergency Dispatch System</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#threeui-hero" className="hover:text-white transition-colors">Emergency Shader</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <Link to="/emergency" className="text-red-400 hover:text-red-300 font-semibold transition-colors">Emergency SOS</Link>
            <Link to="/dashboard" className="text-stone-200 hover:text-white font-medium transition-colors">Demo Mode</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-stone-800 text-center text-xs text-stone-400 space-y-2">
          <p>© 2026 Assistive Emergency Alert (AEA). ThreeUI Riso Sweep Shader Integration.</p>
          <p className="text-stone-400">
            Disclaimer: This application is a prototype assistive emergency alerting system. In immediate life-threatening situations, dial local official emergency dispatch (e.g., 911 / 112).
          </p>
        </div>
      </footer>
    </div>
  );
}
