import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export const THRESHOLD_OPTIONS = [50, 100, 200] as const;

interface SettingsContextValue {
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  thresholdMeters: number;
  setThresholdMeters: (m: number) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [thresholdMeters, setThresholdMeters] = useState(100);

  const setThreshold = useCallback((m: number) => {
    if ((THRESHOLD_OPTIONS as readonly number[]).includes(m)) setThresholdMeters(m);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        voiceEnabled,
        setVoiceEnabled,
        thresholdMeters,
        setThresholdMeters: setThreshold,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
