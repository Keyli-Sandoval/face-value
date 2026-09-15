import { findContainingFeature } from "../vendor/point-in-polygon.js";

// All lookups happen against data bundled with the app — nothing here ever
// makes a network request beyond the app's own static files. See PLAN.md §5.

export async function loadDistrictLayers(jurisdiction) {
  const res = await fetch(`data/districts/${jurisdiction}.json`);
  if (!res.ok) throw new Error(`No bundled district data for "${jurisdiction}"`);
  return res.json();
}

// point: [lng, lat]. layers: the object returned by loadDistrictLayers.
// Returns one result per layer defined in layers.layers, e.g.
// { council: { feature, level: "city" }, legislature: { feature, level: "state" } }
export function lookupByPoint(point, layers) {
  const result = {};
  for (const layer of layers.layers) {
    const feature = findContainingFeature(layer.featureCollection, point);
    result[layer.id] = { feature, level: layer.level, label: layer.label };
  }
  return result;
}

// Resolves a ZIP code to a lookup point using bundled ZIP centroids, then
// flags ambiguity if the ZIP's own coverage area (per layers.zipDistricts)
// spans more than one district in a given layer, rather than silently
// guessing. See PLAN.md §6 step 2 — ask, don't fabricate.
export function lookupByZip(zip, layers) {
  const centroid = layers.zipCentroids[zip];
  if (!centroid) return { covered: false };

  const point = lookupByPoint(centroid, layers);
  const ambiguity = layers.zipDistricts?.[zip] || {};

  for (const layer of layers.layers) {
    const candidates = ambiguity[layer.id];
    if (candidates && candidates.length > 1) {
      point[layer.id] = { ambiguous: true, candidates, level: layer.level, label: layer.label };
    }
  }

  return { covered: true, point };
}
