import { useState, useRef, useCallback } from 'react';

export function useDictionaryAudio() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((url: string) => {
    if (!url) return;

    // Stop current
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay  = () => setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);

    audio.play().catch(() => setPlaying(false));
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  }, []);

  return { playing, play, stop };
}
