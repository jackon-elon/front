import { useCallback, useEffect, useRef, useState } from "react";
import { useLab } from "../state/LabContext";

export function useAmbientSound() {
  const audio = useRef<AudioContext | null>(null);
  const enabledRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const { notify } = useLab();

  const toggle = useCallback(async () => {
    try {
      if (!audio.current) {
        const context = new AudioContext();
        const gain = context.createGain();
        gain.gain.value = 0.023;
        gain.connect(context.destination);
        for (const frequency of [110, 165.2, 220.1]) {
          const oscillator = context.createOscillator();
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          oscillator.connect(gain);
          oscillator.start();
        }
        audio.current = context;
      }
      if (enabledRef.current) {
        await audio.current.suspend();
        enabledRef.current = false;
      } else {
        await audio.current.resume();
        enabledRef.current = audio.current.state === "running";
      }
      setEnabled(enabledRef.current);
    } catch {
      notify("当前浏览器无法播放环境音");
    }
  }, [notify]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!audio.current || !enabledRef.current) return;
      if (document.hidden) void audio.current.suspend();
      else void audio.current.resume().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      void audio.current?.close().catch(() => undefined);
      audio.current = null;
      enabledRef.current = false;
    };
  }, []);

  return { enabled, toggle };
}
