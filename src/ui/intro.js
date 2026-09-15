import { el, clear } from "./dom.js";

// PLAN.md §5: the privacy statement must render before any location input,
// not behind a link. Phase 1 has no location input yet (hard-coded location),
// but the statement still ships up front since it's non-negotiable.
export function renderIntro(container, { locationLabel, onStart }) {
  clear(container);

  const view = el("div", { class: "intro" }, [
    el("h1", { text: "Face Value" }),
    el("p", { class: "tagline", text: "A plain-language voter guide." }),
    el("p", {
      text:
        "You'll see a handful of real local policies, described in plain language, " +
        "with the politician's name hidden. React first. Then we'll show you who was " +
        "behind it and how it turned out.",
    }),
    el("div", { class: "privacy-box" }, [
      el("h2", { text: "Before you start" }),
      el("ul", {}, [
        el("li", { text: "Your address never leaves your browser. It is never sent to any server." }),
        el("li", { text: "No account, no login, no email — ever." }),
        el("li", { text: "Nothing you do here is tracked or saved after you close this tab." }),
        el("li", { text: "This never tells you who to vote for. It only shows what happened." }),
      ]),
    ]),
    el("div", { class: "location-note" }, [
      el("strong", { text: "Phase 1 demo notice: " }),
      document.createTextNode(
        `Address lookup isn't built yet. This preview is showing example results for ${locationLabel}.`
      ),
    ]),
    el("button", {
      class: "btn",
      type: "button",
      text: "Start",
      onclick: onStart,
    }),
  ]);

  container.appendChild(view);
}
