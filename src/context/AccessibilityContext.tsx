import { createContext, useContext, useState, type ReactNode } from 'react';

type AccessibilityContextType = {
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (val: boolean) => void;
  largeButtons: boolean;
  setLargeButtons: (val: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [largeButtons, setLargeButtons] = useState(false);

  return (
    <AccessibilityContext.Provider value={{
      highContrast, setHighContrast,
      largeText, setLargeText,
      reduceMotion, setReduceMotion,
      largeButtons, setLargeButtons
    }}>
      <div className={`min-h-screen transition-colors duration-300
        ${highContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}
        ${largeText ? 'text-lg' : 'text-base'}
      `}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
}
