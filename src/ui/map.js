import { clear } from "./dom.js";
import { computeBounds, makeProjection, geometryToSvgPath } from "../geo/project.js";
import { lookupByPoint } from "../geo/district-lookup.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// Renders the finest-grained (first) layer's boundaries as a clickable SVG
// map, zoomed to that layer's extent. Clicking runs the same point-in-polygon
// lookup used for the text-entry path, so the two paths in PLAN.md §6 step 2
// share one source of truth — it just also resolves every other bundled
// layer (e.g. the state legislative district) for the same point.
export function renderMap(container, { layers, onPick }) {
  clear(container);

  const visibleLayer = layers.layers[0];
  const bounds = computeBounds([visibleLayer.featureCollection]);
  const projection = makeProjection(bounds, 600, 16);

  const svg = svgEl("svg", {
    viewBox: `0 0 ${projection.viewSize} ${projection.viewSize}`,
    role: "img",
    "aria-label": "Map of covered districts. Click your approximate location.",
    tabindex: "0",
    style: "width:100%;height:auto;background:var(--surface);border:2px solid var(--border);border-radius:12px;cursor:crosshair;",
  });

  for (const feature of visibleLayer.featureCollection.features) {
    const path = svgEl("path", {
      d: geometryToSvgPath(feature.geometry, projection.toSvg),
      fill: "color-mix(in srgb, var(--accent) 10%, white)",
      stroke: "var(--accent)",
      "stroke-width": "1.5",
    });
    svg.appendChild(path);
  }

  const marker = svgEl("circle", { r: "6", fill: "var(--disagree)", stroke: "white", "stroke-width": "2", hidden: "true" });
  svg.appendChild(marker);

  function handlePick(evt) {
    const rect = svg.getBoundingClientRect();
    const scaleX = projection.viewSize / rect.width;
    const scaleY = projection.viewSize / rect.height;
    const x = (evt.clientX - rect.left) * scaleX;
    const y = (evt.clientY - rect.top) * scaleY;

    marker.removeAttribute("hidden");
    marker.setAttribute("cx", x);
    marker.setAttribute("cy", y);

    const point = projection.toLngLat([x, y]);
    onPick(point, lookupByPoint(point, layers));
  }

  svg.addEventListener("click", handlePick);

  container.appendChild(svg);
}
