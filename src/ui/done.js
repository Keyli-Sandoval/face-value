import { el, clear, announce } from "./dom.js";

const REACTION_LABEL = {
  agree: "Agree",
  disagree: "Disagree",
  "not-sure": "Not sure",
};

const STATUS_LABEL = {
  passed: "Passed",
  failed: "Failed",
  pending: "Still pending",
  "blocked-in-court": "Blocked in court",
};

const LEVEL_LABEL = {
  city: "City",
  state: "State",
};

function formatDate(iso) {
  if (!iso) return "date unknown";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function compareLine({ response, testVote }) {
  if (!response.reaction || !testVote) return null;
  const userSaidYes = response.reaction === "agree";
  const userSaidNo = response.reaction === "disagree";
  const repSaidYes = testVote.vote === "yes";
  const repSaidNo = testVote.vote === "no";

  if (response.reaction === "not-sure") return "You weren't sure. Here's how your representative voted.";
  if ((userSaidYes && repSaidYes) || (userSaidNo && repSaidNo)) return "Your reaction matched your representative's vote.";
  if ((userSaidYes && repSaidNo) || (userSaidNo && repSaidYes)) return "Your reaction differed from your representative's vote.";
  return "Your representative's vote doesn't map cleanly to your reaction.";
}

function whoLine({ card, sponsor, boardMembers }) {
  if (sponsor) return `${card.sponsor_role || "Introduced by"}: ${sponsor.name}`;
  if (boardMembers && boardMembers.length > 0) return `Approved by: ${card.approving_body || "an elected board"}`;
  if (card.approving_body) return `Approved by: ${card.approving_body}`;
  return null;
}

function itemToText(item) {
  const { card, response, testPerson, testVote } = item;
  const lines = [];
  lines.push(card.plain_title);
  lines.push(`You said: ${REACTION_LABEL[response.reaction] || "skipped"}`);
  const who = whoLine(item);
  if (who) lines.push(who);
  lines.push(`Status: ${STATUS_LABEL[card.status] || card.status} — ${formatDate(card.status_date)}`);
  if (testPerson) {
    lines.push(`How ${testPerson.name} voted: ${testVote ? testVote.vote.toUpperCase() : (card.votes_note || "no recorded vote")}`);
  }
  const compare = compareLine(item);
  if (compare) lines.push(compare);
  const primary = card.sources && card.sources[0];
  if (primary) lines.push(`Source: ${card.official_ref} — ${primary.url}`);
  return lines.join("\n");
}

function summaryToText(items) {
  const header = [
    "Face Value — Your Summary",
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    "",
  ];
  const body = items.map((item, i) => `${i + 1}. ${itemToText(item)}`).join("\n\n");
  return header.join("\n") + "\n" + body + "\n";
}

function renderRecapItem(item) {
  const { card, response, testPerson, testVote } = item;
  const who = whoLine(item);
  const compare = compareLine(item);
  const primary = card.sources && card.sources[0];

  return el("div", { class: "recap-item" }, [
    el("span", { class: "level-badge", text: LEVEL_LABEL[card.jurisdiction_level] || "CITY" }),
    el("h3", { text: card.plain_title }),
    el("p", { class: "recap-line", text: `You said: ${REACTION_LABEL[response.reaction] || "skipped"}` }),
    who ? el("p", { class: "recap-line", text: who }) : null,
    el("p", {
      class: "recap-line",
      text: `Status: ${STATUS_LABEL[card.status] || card.status} — ${formatDate(card.status_date)}`,
    }),
    testPerson
      ? el("p", {
          class: "recap-line",
          text: `How ${testPerson.name} voted: ${testVote ? testVote.vote.toUpperCase() : (card.votes_note || "no recorded vote")}`,
        })
      : null,
    compare ? el("p", { class: "recap-line recap-compare", text: compare }) : null,
    primary
      ? el("p", { class: "recap-source" }, [
          document.createTextNode(card.official_ref + " — "),
          el("a", { href: primary.url, target: "_blank", rel: "noopener noreferrer", text: primary.title }),
        ])
      : null,
  ].filter(Boolean));
}

async function copySummary(text, feedback) {
  clear(feedback);
  try {
    await navigator.clipboard.writeText(text);
    feedback.appendChild(el("p", { class: "copy-status", text: "Copied to your clipboard." }));
    announce("Summary copied to clipboard.");
  } catch (err) {
    const textarea = el("textarea", {
      class: "copy-fallback",
      readonly: "readonly",
      "aria-label": "Summary text — select all and copy",
    });
    textarea.value = text;
    feedback.appendChild(el("p", { class: "copy-status", text: "Couldn't copy automatically. The text is selected below — press Ctrl/Cmd+C." }));
    feedback.appendChild(textarea);
    textarea.focus();
    textarea.select();
    announce("Automatic copy failed. Summary text is selected for manual copying.");
  }
}

// PLAN.md §6 step 7 / §3 success criterion 4: printable/saveable as PDF and
// copyable as plain text. Print styling lives in styles.css, scoped to
// .summary-view so only this screen is affected.
export function renderDone(container, { items, onRestart, onPrint }) {
  clear(container);

  const copyFeedback = el("div", { role: "status", "aria-live": "polite", class: "copy-feedback" });

  const view = el("div", { class: "summary-view" }, [
    el("h1", { text: "Your summary" }),
    el(
      "p",
      { class: "no-print" },
      "Here's everything you reacted to. Print it, save it as a PDF, or copy it as plain text to keep or share."
    ),
    el("div", { class: "summary-actions no-print" }, [
      el("button", { class: "btn", type: "button", text: "Print / Save as PDF", onclick: onPrint }),
      el("button", {
        class: "btn btn-secondary",
        type: "button",
        text: "Copy as text",
        onclick: () => copySummary(summaryToText(items), copyFeedback),
      }),
    ]),
    copyFeedback,
    ...items.map(renderRecapItem),
    el("button", {
      class: "btn btn-secondary no-print",
      type: "button",
      text: "Start over",
      onclick: onRestart,
    }),
  ]);

  container.appendChild(view);
}
