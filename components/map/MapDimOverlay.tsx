import React, { useEffect, useRef, useState } from 'react';
import { Polygon } from 'react-native-maps';

const WORLD_COORDINATES = [
  { latitude: 85, longitude: -179 },
  { latitude: 85, longitude: 179 },
  { latitude: -85, longitude: 179 },
  { latitude: -85, longitude: -179 },
];

const DURATION = 220;
const FRAME_MS = 16;
const FRAMES = Math.ceil(DURATION / FRAME_MS);

interface MapDimOverlayProps {
  visible: boolean;
  onPress?: () => void;
}

export default function MapDimOverlay({ visible, onPress }: MapDimOverlayProps) {
  const [fillColor, setFillColor] = useState('rgba(0,0,0,0)');
  const [mounted, setMounted] = useState(false);
  const alphaRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const start = alphaRef.current;
    const target = visible ? 0.5 : 0;

    if (visible) setMounted(true);

    let frame = 0;
    intervalRef.current = setInterval(() => {
      frame++;
      const progress = Math.min(frame / FRAMES, 1);
      const alpha = start + (target - start) * progress;
      alphaRef.current = alpha;
      setFillColor(`rgba(0,0,0,${alpha.toFixed(3)})`);
      if (frame >= FRAMES) {
        clearInterval(intervalRef.current!);
        if (!visible) setMounted(false);
      }
    }, FRAME_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  if (!mounted) return null;

  return (
    <Polygon
      coordinates={WORLD_COORDINATES}
      fillColor={fillColor}
      strokeWidth={0}
      strokeColor="rgba(0,0,0,0)"
      tappable
      onPress={onPress}
    />
  );
}
