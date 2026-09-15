// Ray-casting point-in-polygon test. Standard algorithm (Franklin's PNPOLY),
// vendored per PLAN.md §4 rather than adding a package manager.
//
// point: [lng, lat]
// polygon: array of [lng, lat] rings, GeoJSON-style — polygon[0] is the outer
// ring, any further rings are holes.
export function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (const ring of polygon) {
    let ringInside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersects =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersects) ringInside = !ringInside;
    }
    if (ring === polygon[0]) {
      inside = ringInside;
    } else if (ringInside) {
      // point falls inside a hole, so it's outside the polygon
      inside = false;
    }
  }

  return inside;
}

// geometry: a GeoJSON Polygon or MultiPolygon `geometry` object.
export function pointInGeometry(point, geometry) {
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((poly) => pointInPolygon(point, poly));
  }
  return false;
}

// Finds the first feature in a FeatureCollection whose geometry contains
// `point` ([lng, lat]). Returns the feature, or null if none match.
export function findContainingFeature(featureCollection, point) {
  for (const feature of featureCollection.features) {
    if (pointInGeometry(point, feature.geometry)) return feature;
  }
  return null;
}
