import { el, clear } from "./dom.js";

// PLAN.md §6 step 3 / §8: multi-select issue picker, skippable. Hide any
// section with zero matching cards rather than showing an empty result.
export function renderSections(container, { sections, cardsBySection, selected, onToggle, onContinue, onSkip }) {
  clear(container);

  const available = sections.filter((s) => (cardsBySection.get(s.id) || 0) > 0);

  const view = el("div", {}, [
    el("h1", { text: "What do you want to see?" }),
    el("p", { text: "Pick as many as you like, or skip this and see everything." }),
    el(
      "div",
      { class: "section-grid", role: "group", "aria-label": "Issue sections" },
      available.map((s) =>
        el("button", {
          class: "section-chip",
          type: "button",
          "aria-pressed": String(selected.has(s.id)),
          text: `${s.label} (${cardsBySection.get(s.id)})`,
          onclick: () => onToggle(s.id),
        })
      )
    ),
    el("div", { class: "deck-nav" }, [
      el("button", { class: "btn btn-secondary", type: "button", text: "Skip — show everything", onclick: onSkip }),
      el("button", { class: "btn", type: "button", text: "Continue", onclick: onContinue }),
    ]),
  ]);

  container.appendChild(view);
}
