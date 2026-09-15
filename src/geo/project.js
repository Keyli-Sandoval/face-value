// Simple equirectangular-ish projection for rendering a small (city-sized)
// area of lng/lat GeoJSON as an SVG map. Not suitable for anything larger
// than a metro area — that's all this app ever needs.

function forEachCoord(geometry, fn) {
  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring) => ring.forEach(fn));
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((poly) => poly.forEach((ring) => ring.forEach(fn)));
  }
}

export function computeBounds(featureCollections) {
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const fc of featureCollections) {
    for (const feature of fc.features) {
      forEachCoord(feature.geometry, ([lng, lat]) => {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });
    }
  }
  return { minLng, maxLng, minLat, maxLat };
}

// Builds a projector between [lng, lat] and SVG [x, y] within a viewBox of
// the given size, preserving aspect ratio (with a small margin) so shapes
// aren't stretched.
export function makeProjection(bounds, viewSize = 600, margin = 20) {
  const { minLng, maxLng, minLat, maxLat } = bounds;
  const midLat = (minLat + maxLat) / 2;
  const lngScale = Math.cos((midLat * Math.PI) / 180); // correct for lng compression

  const width = (maxLng - minLng) * lngScale;
  const height = maxLat - minLat;
  const usable = viewSize - margin * 2;
  const scale = usable / Math.max(width, height);

  const offsetX = margin + (usable - width * scale) / 2;
  const offsetY = margin + (usable - height * scale) / 2;

  function toSvg([lng, lat]) {
    const x = (lng - minLng) * lngScale * scale + offsetX;
    const y = (maxLat - lat) * scale + offsetY; // flip y: north is up
    return [x, y];
  }

  function toLngLat([x, y]) {
    const lng = (x - offsetX) / (lngScale * scale) + minLng;
    const lat = maxLat - (y - offsetY) / scale;
    return [lng, lat];
  }

  return { toSvg, toLngLat, viewSize };
}

export function geometryToSvgPath(geometry, toSvg) {
  const ringToPath = (ring) =>
    ring
      .map((coord, i) => {
        const [x, y] = toSvg(coord);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map(ringToPath).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flat().map(ringToPath).join(" ");
  }
  return "";
}
