import { el, clear } from "./dom.js";
import { renderMap } from "./map.js";
import { lookupByZip } from "../geo/district-lookup.js";

// PLAN.md §5/§6: street name + ZIP only, never a house number. Everything
// here runs against data already loaded into the page — nothing is sent
// anywhere, which you can verify in the network tab.
export function renderLocation(container, { layers, exampleLabel, onResolved, onUseExample }) {
  clear(container);

  let mode = "form"; // "form" | "map"

  function renderForm() {
    clear(container);

    const streetInput = el("input", { type: "text", id: "street", name: "street", autocomplete: "off", placeholder: "e.g. O Street" });
    const zipInput = el("input", { type: "text", id: "zip", name: "zip", inputmode: "numeric", maxlength: "5", placeholder: "e.g. 68508" });
    const feedback = el("div", { role: "status", "aria-live": "polite" });

    function handleSubmit(evt) {
      evt.preventDefault();
      const zip = zipInput.value.trim();
      const result = lookupByZip(zip, layers);

      clear(feedback);

      if (!result.covered) {
        feedback.appendChild(
          el("div", { class: "location-note" }, [
            el("p", { text: `We don't have coverage for ZIP ${zip || "(blank)"} yet.` }),
            el("p", { text: "We won't guess at content for an area we haven't sourced. Try an example Lincoln address instead:" }),
            el("button", { class: "btn btn-secondary", type: "button", text: `Use example: ${exampleLabel}`, onclick: onUseExample }),
          ])
        );
        return;
      }

      const ambiguousLayer = Object.entries(result.point).find(([, v]) => v.ambiguous);
      if (ambiguousLayer) {
        const [, info] = ambiguousLayer;
        feedback.appendChild(
          el("div", { class: "location-note" }, [
            el("p", { text: `Your ZIP code crosses more than one ${info.label} boundary — a street name alone can't pin down which side you're on.` }),
            el("button", { class: "btn", type: "button", text: "Find myself on the map instead", onclick: () => { mode = "map"; renderMapMode(); } }),
          ])
        );
        return;
      }

      onResolved(result.point, { street: streetInput.value.trim(), zip });
    }

    const form = el("form", { onsubmit: handleSubmit }, [
      el("h1", { text: "Where do you live?" }),
      el("p", { text: "Street name and ZIP only — never a house number. This never leaves your browser." }),
      el("label", { for: "street", text: "Street name" }),
      streetInput,
      el("label", { for: "zip", text: "ZIP code" }),
      zipInput,
      el("button", { class: "btn", type: "submit", text: "Find my representatives" }),
      feedback,
      el("button", {
        class: "btn btn-secondary",
        type: "button",
        text: "I'd rather find myself on a map",
        onclick: () => { mode = "map"; renderMapMode(); },
      }),
    ]);

    container.appendChild(form);
  }

  function renderMapMode() {
    clear(container);
    const mapContainer = el("div", {});
    const confirmArea = el("div", { role: "status", "aria-live": "polite" });

    container.appendChild(el("h1", { text: "Tap your approximate location" }));
    container.appendChild(el("p", { text: "Nothing about your exact position is stored or sent anywhere." }));
    container.appendChild(mapContainer);
    container.appendChild(confirmArea);
    container.appendChild(
      el("button", { class: "btn btn-secondary", type: "button", text: "Back to address entry", onclick: () => { mode = "form"; renderForm(); } })
    );

    renderMap(mapContainer, {
      layers,
      onPick: (point, lookupResult) => {
        clear(confirmArea);
        const missing = Object.values(lookupResult).some((v) => !v.feature);
        if (missing) {
          confirmArea.appendChild(el("p", { class: "location-note", text: "That point is outside our covered area. Try clicking inside the shaded region." }));
          return;
        }
        confirmArea.appendChild(
          el("div", { class: "location-note" }, [
            ...Object.values(lookupResult).map((v) =>
              el("p", { text: `${v.label}: ${v.feature.properties.name}` })
            ),
            el("button", { class: "btn", type: "button", text: "Continue", onclick: () => onResolved(lookupResult, { street: null, zip: null }) }),
          ])
        );
      },
    });
  }

  renderForm();
}
