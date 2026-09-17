import { el, clear } from "./dom.js";

const LEVELS = [
  { id: "city", label: "City" },
  { id: "state", label: "State" },
];

// PLAN.md §6 step 3 / §8: multi-select issue picker, skippable. Hide any
// section or level with zero matching cards rather than showing an empty
// result. Topic and "how local it is" are the only two filters — both
// optional, both AND together when both are set.
export function renderSections(container, { sections, cardsBySection, cardsByLevel, selected, selectedLevels, onToggle, onToggleLevel, onContinue, onSkip }) {
  clear(container);

  const available = sections.filter((s) => (cardsBySection.get(s.id) || 0) > 0);
  const availableLevels = LEVELS.filter((l) => (cardsByLevel.get(l.id) || 0) > 0);

  const view = el("div", {}, [
    el("h1", { text: "What do you want to see?" }),
    el("p", { text: "Pick as many as you like, or skip this and see everything." }),
    el("h2", { class: "filter-heading", text: "Topic" }),
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
    availableLevels.length > 1
      ? el("h2", { class: "filter-heading", text: "How local" })
      : null,
    availableLevels.length > 1
      ? el(
          "div",
          { class: "section-grid", role: "group", "aria-label": "Level of government" },
          availableLevels.map((l) =>
            el("button", {
              class: "section-chip",
              type: "button",
              "aria-pressed": String(selectedLevels.has(l.id)),
              text: `${l.label} (${cardsByLevel.get(l.id)})`,
              onclick: () => onToggleLevel(l.id),
            })
          )
        )
      : null,
    el("div", { class: "deck-nav" }, [
      el("button", { class: "btn btn-secondary", type: "button", text: "Skip — show everything", onclick: onSkip }),
      el("button", { class: "btn", type: "button", text: "Continue", onclick: onContinue }),
    ]),
  ].filter(Boolean));

  container.appendChild(view);
}
