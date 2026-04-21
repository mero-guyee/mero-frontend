import React from 'react';
import { Polyline } from 'react-native-maps';

interface CustomPolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  color: string;
  isSelected: boolean;
  isDeselected: boolean;
  onPress: () => void;
}

function darkenHex(hex: string, amount: number = 0.4): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const dr = Math.max(0, Math.round(r * (1 - amount)));
  const dg = Math.max(0, Math.round(g * (1 - amount)));
  const db = Math.max(0, Math.round(b * (1 - amount)));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

export default function CustomPolyline({
  coordinates,
  color,
  isSelected,
  isDeselected,
  onPress,
}: CustomPolylineProps) {
  if (coordinates.length < 2) return null;

  const borderColor = isSelected ? darkenHex(color, 0.4) : isDeselected ? '#ffffff30' : '#30221B';

  const mainColor = isDeselected ? `${color}40` : color;

  return (
    <>
      <Polyline
        coordinates={coordinates}
        strokeColor={borderColor}
        strokeWidth={isSelected ? 14 : 12}
        tappable={!isSelected && !isDeselected}
        onPress={onPress}
        geodesic={true}
      />
      <Polyline
        coordinates={coordinates}
        strokeColor={mainColor}
        strokeWidth={isSelected ? 10 : 9}
        tappable={!isSelected && !isDeselected}
        onPress={onPress}
        geodesic={true}
      />
    </>
  );
}
