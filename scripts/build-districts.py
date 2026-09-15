#!/usr/bin/env python3
"""Builds data/districts/lincoln.json from the raw GeoJSON in
data/districts/raw/. Run this whenever the raw boundary files change —
do not hand-edit lincoln.json.

Raw source provenance (see README.md and PLAN.md §5 for why this matters —
address lookups must run against real, bundled boundary data, never a live
geocoder):

  lincoln-council-districts.geojson
    Lincoln Open Data Portal, "City Council Districts" dataset
    (item 340e1f7de6994085b23e391409b5da4c), via its GeoJSON download
    endpoint. Underlying service:
    https://gis.lincoln.ne.gov/public/rest/services/Planning/Elections/MapServer/0

  lincoln-state-leg-districts.geojson
    Lincoln Open Data Portal, "State Legislative Districts" dataset
    (item 559c78766863458eb8e5190b01f3c652, layer 6) — pre-filtered to the
    9 Nebraska Legislature districts that reach Lancaster County.

  lincoln-zctas.geojson
    US Census Bureau TIGERweb REST service
    (TIGERweb/PUMA_TAD_TAZ_UGA_UGA_ZCTA/MapServer, layer 11, "ZIP Code
    Tabulation Areas"), queried by an envelope covering Lincoln.

Run: python3 scripts/build-districts.py
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(ROOT, "data", "districts", "raw")
OUT_PATH = os.path.join(ROOT, "data", "districts", "lincoln.json")


def load(name):
    with open(os.path.join(RAW_DIR, name)) as f:
        return json.load(f)


def as_multipolygon_coords(geom):
    """Return a list of polygons (each a list of rings, each a list of [lng,lat])."""
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    return []


def point_in_ring(x, y, ring):
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def point_in_polygon(point, polygons):
    """polygons: list of polygons, each a list of rings (outer first, holes after)."""
    x, y = point
    for poly in polygons:
        if not poly:
            continue
        if point_in_ring(x, y, poly[0]):
            in_hole = any(point_in_ring(x, y, poly[i]) for i in range(1, len(poly)))
            if not in_hole:
                return True
    return False


def ring_centroid_area(ring):
    area = 0.0
    cx = 0.0
    cy = 0.0
    n = len(ring)
    for i in range(n - 1):
        x0, y0 = ring[i]
        x1, y1 = ring[i + 1]
        cross = x0 * y1 - x1 * y0
        area += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    area *= 0.5
    if area == 0:
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        return sum(xs) / len(xs), sum(ys) / len(ys), 0.0
    cx /= 6 * area
    cy /= 6 * area
    return cx, cy, abs(area)


def geometry_centroid(geom):
    polygons = as_multipolygon_coords(geom)
    total_area = 0.0
    cx_sum = 0.0
    cy_sum = 0.0
    for poly in polygons:
        if not poly:
            continue
        cx, cy, area = ring_centroid_area(poly[0])
        if area == 0:
            continue
        total_area += area
        cx_sum += cx * area
        cy_sum += cy * area
    if total_area == 0:
        pts = [p for poly in polygons for ring in poly for p in ring]
        return [sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)]
    return [cx_sum / total_area, cy_sum / total_area]


def sample_points(geom, n_grid=6):
    """Grid-sample candidate interior points across the geometry's bbox,
    keeping only ones actually inside the polygon (plus the centroid)."""
    polygons = as_multipolygon_coords(geom)
    xs = [p[0] for poly in polygons for ring in poly for p in ring]
    ys = [p[1] for poly in polygons for ring in poly for p in ring]
    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)
    pts = [geometry_centroid(geom)]
    for i in range(n_grid):
        for j in range(n_grid):
            x = minx + (maxx - minx) * (i + 0.5) / n_grid
            y = miny + (maxy - miny) * (j + 0.5) / n_grid
            if point_in_polygon([x, y], polygons):
                pts.append([x, y])
    return pts


# ---- Load raw sources ----
council_raw = load("lincoln-council-districts.geojson")
leg_raw = load("lincoln-state-leg-districts.geojson")
zcta_raw = load("lincoln-zctas.geojson")

# ---- Merge council features by CCDIST (District 2 ships as 2 polygons) ----
council_by_dist = {}
for f in council_raw["features"]:
    dist = f["properties"]["CCDIST"]
    council_by_dist.setdefault(dist, {"polys": []})
    council_by_dist[dist]["polys"].extend(as_multipolygon_coords(f["geometry"]))

# Maps a district number to the person.json id for its current officeholder.
# Extend this (and LEG_PERSON_ID below) as more people are added.
COUNCIL_PERSON_ID = {
    1: "person-lincoln-council-d1",
    2: "person-lincoln-council-d2",
    3: "person-lincoln-council-d3",
    4: "person-lincoln-council-d4",
}

council_features = []
for dist, info in sorted(council_by_dist.items()):
    council_features.append({
        "type": "Feature",
        "properties": {"name": f"District {dist}", "person_id": COUNCIL_PERSON_ID.get(dist)},
        "geometry": {"type": "MultiPolygon", "coordinates": info["polys"]},
    })

council_fc = {"type": "FeatureCollection", "features": council_features}
council_polys_by_dist = {dist: info["polys"] for dist, info in council_by_dist.items()}

# ---- Legislative districts: attach person_id only where sourced ----
LEG_PERSON_ID = {
    "26": "person-ne-senator-d26",
}

leg_features = []
leg_polys_by_dist = {}
for f in leg_raw["features"]:
    dist_num = str(f["properties"].get("District_N") or f["properties"].get("District_1"))
    polys = as_multipolygon_coords(f["geometry"])
    leg_polys_by_dist[dist_num] = polys
    leg_features.append({
        "type": "Feature",
        "properties": {"name": f"District {dist_num}", "person_id": LEG_PERSON_ID.get(dist_num)},
        "geometry": {"type": "MultiPolygon", "coordinates": polys},
    })

leg_fc = {"type": "FeatureCollection", "features": leg_features}

# ---- ZIP centroids + coverage + ambiguity, derived from real ZCTA polygons ----
zip_centroids = {}
zip_districts = {}
all_council_polys = [p for polys in council_polys_by_dist.values() for p in polys]

for f in zcta_raw["features"]:
    props = f["properties"]
    zcta = props.get("ZCTA5CE20") or props.get("ZCTA5CE") or props.get("GEOID20") or props.get("GEOID")
    if not zcta:
        continue
    geom = f["geometry"]
    centroid = geometry_centroid(geom)

    # Only keep ZIPs that actually overlap Lincoln's council districts (drops
    # rural/outlying ZCTAs caught by the bounding-box query). If the ZCTA's
    # true geometric centroid falls in a gap (a big rural ZIP whose centroid
    # lands outside every district), fall back to a sampled interior point
    # that IS inside a district — the stored point must be one we can
    # successfully look up, or the runtime lookup and the ambiguity summary
    # computed below would disagree with each other.
    lookup_point = centroid
    if not point_in_polygon(lookup_point, all_council_polys):
        samples = sample_points(geom, n_grid=8)
        inside = next((s for s in samples if point_in_polygon(s, all_council_polys)), None)
        if inside is None:
            continue
        lookup_point = inside

    zip_centroids[zcta] = [round(lookup_point[0], 6), round(lookup_point[1], 6)]

    samples = sample_points(geom, n_grid=6)
    council_hits = set()
    leg_hits = set()
    for s in samples:
        for dist, polys in council_polys_by_dist.items():
            if point_in_polygon(s, polys):
                council_hits.add(f"District {dist}")
        for dist, polys in leg_polys_by_dist.items():
            if point_in_polygon(s, polys):
                leg_hits.add(f"District {dist}")

    zip_districts[zcta] = {
        "council": sorted(council_hits),
        "legislature": sorted(leg_hits),
    }

bundle = {
    "layers": [
        {"id": "council", "label": "City Council district", "level": "city", "featureCollection": council_fc},
        {"id": "legislature", "label": "Legislative district", "level": "state", "featureCollection": leg_fc},
    ],
    "zipCentroids": zip_centroids,
    "zipDistricts": zip_districts,
}

with open(OUT_PATH, "w") as f:
    json.dump(bundle, f)

print(f"ZIPs covered: {len(zip_centroids)}")
print(sorted(zip_centroids.keys()))
print("\nAmbiguous ZIPs (span >1 district in some layer):")
for zcta, d in zip_districts.items():
    if len(d["council"]) > 1 or len(d["legislature"]) > 1:
        print(" ", zcta, d)
print(f"\nOutput written: {OUT_PATH}")
