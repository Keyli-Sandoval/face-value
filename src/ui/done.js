import { el, clear } from "./dom.js";

const REACTION_LABEL = {
  agree: "Agree",
  disagree: "Disagree",
  "not-sure": "Not sure",
};

export function renderDone(container, { cards, responses, onRestart }) {
  clear(container);

  const items = cards.map((card) => {
    const r = responses[card.id] || {};
    return el("div", { class: "recap-item" }, [
      el("h3", { text: card.plain_title }),
      el("p", { class: "recap-line", text: `You said: ${REACTION_LABEL[r.reaction] || "skipped"}` }),
      el("p", { class: "recap-line", text: `Status: ${card.status.replace(/-/g, " ")}` }),
    ]);
  });

  const view = el("div", {}, [
    el("h1", { text: "That's everything for now" }),
    el(
      "p",
      {
        text:
          "Here's what you reacted to. A printable, shareable summary is coming in a " +
          "later version of this widget.",
      }
    ),
    ...items,
    el("button", {
      class: "btn btn-secondary",
      type: "button",
      text: "Start over",
      onclick: onRestart,
    }),
  ]);

  container.appendChild(view);
}
