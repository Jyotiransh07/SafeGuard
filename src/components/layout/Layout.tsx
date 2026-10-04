import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Phone, MapPin, History, Settings, ShieldAlert } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function Layout() {
  const location = useLocation();
  const { highContrast } = useAccessibility();
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Command' },
    { path: '/contacts', icon: Phone, label: 'Contacts' },
    { path: '/emergency', icon: ShieldAlert, label: 'SOS', isPrimary: true },
    { path: '/location', icon: MapPin, label: 'Location' },
    { path: '/history', icon: History, label: 'Logs' },
  ];

  const headerBg = highContrast ? 'bg-stone-900 border-b border-stone-700' : 'bg-[#f8f7f4]/90 backdrop-blur-md border-b border-stone-200/80';
  const textColor = highContrast ? 'text-stone-300' : 'text-stone-600';
  const activeColor = highContrast ? 'text-red-400 font-bold' : 'text-red-600 font-bold';

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 selection:bg-red-500 selection:text-white pb-20 md:pb-0 md:pt-16">
      {/* Decorative Top Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 fixed top-0 left-0 z-[60]"></div>

      {/* Desktop Header */}
      <header className={`hidden md:flex fixed top-0 w-full h-16 ${headerBg} z-50 items-center justify-between px-6 transition-all`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-stone-900 block leading-none">AEA</span>
              <span className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">SafeGuard Pro</span>
            </div>
          </Link>
          <span className="ml-3 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200 rounded-full">
            ● Live System
          </span>
        </div>

        <nav className="flex items-center gap-7">
          {navItems.map((item) => {
            if (item.isPrimary) return null;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`text-sm font-medium flex items-center gap-2 transition-colors hover:text-red-600 ${isActive ? activeColor : textColor}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          
          <Link 
            to="/accessibility" 
            className={`text-sm font-medium transition-colors hover:text-red-600 ${location.pathname === '/accessibility' ? activeColor : textColor}`}
          >
            Accessibility
          </Link>

          <Link 
            to="/settings" 
            className={`p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors ${textColor}`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="max-w-md md:max-w-4xl mx-auto p-4 md:p-6 min-h-[calc(100vh-4.5rem)]">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full h-20 bg-[#f8f7f4]/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(28,25,23,0.06)] z-50 flex justify-around items-center px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isPrimary) {
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="relative -top-5 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 shadow-[0_8px_24px_rgba(220,38,38,0.4)] flex items-center justify-center text-white ring-4 ring-[#f8f7f4] transition-transform active:scale-95">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-bold mt-1 text-red-600 font-mono tracking-wider">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-2 min-w-[4rem] transition-colors ${isActive ? activeColor : textColor}`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
