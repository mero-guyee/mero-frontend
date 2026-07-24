/**
 * Native `fitToCoordinates` computes the bounding box of the raw coordinates
 * you give it. On iOS this is a naive min/max in linear map-point space with
 * no wraparound awareness, so two points like -72° (Peru) and 127° (Korea)
 * get framed via the long way around (199°) instead of the short way across
 * the antimeridian (161°) — the camera ends up centered on empty ocean/Africa
 * instead of on either pin.
 *
 * Fix: shift the points that are on the "wrong side" by ±360° so the whole
 * set becomes one contiguous, non-wrapping range before handing it to
 * `fitToCoordinates`. Android's LatLng constructor normalizes longitude back
 * into [-180, 180) anyway, so this is a no-op there (Android's own
 * LatLngBounds.Builder already resolves antimeridian crossings correctly).
 */
export function unwrapLongitudesForFit<T extends { longitude: number }>(coords: T[]): T[] {
  if (coords.length < 2) return coords;

  const lngs = coords.map((c) => c.longitude);
  const naiveSpan = Math.max(...lngs) - Math.min(...lngs);
  if (naiveSpan <= 180) return coords;

  const order = coords.map((_, i) => i).sort((a, b) => lngs[a] - lngs[b]);
  const n = order.length;

  let maxGap = -1;
  let gapIndex = 0;
  for (let i = 0; i < n; i++) {
    const curr = lngs[order[i]];
    const next = lngs[order[(i + 1) % n]];
    const gap = i === n - 1 ? next + 360 - curr : next - curr;
    if (gap > maxGap) {
      maxGap = gap;
      gapIndex = i;
    }
  }

  if (gapIndex === n - 1) return coords;

  const shiftIndices = new Set(order.slice(0, gapIndex + 1));
  return coords.map((c, i) => (shiftIndices.has(i) ? { ...c, longitude: c.longitude + 360 } : c));
}
