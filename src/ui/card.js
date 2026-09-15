import { el, clear, announce } from "./dom.js";

const REACTIONS = [
  { id: "agree", label: "Agree" },
  { id: "disagree", label: "Disagree" },
  { id: "not-sure", label: "Not sure" },
];

const STATUS_LABEL = {
  passed: "Passed",
  failed: "Failed",
  pending: "Still pending",
  "blocked-in-court": "Blocked in court",
};

function formatDate(iso) {
  if (!iso) return "date unknown";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function renderImpacts(card) {
  if (!card.impacts || card.impacts.length === 0) return null;
  return el("details", { class: "card-impacts" }, [
    el("summary", { text: "What this policy means for me" }),
    el(
      "ul",
      {},
      card.impacts.map((impact) => {
        const source = card.sources.find((s) => s.id === impact.source_id);
        return el("li", {}, [
          document.createTextNode(impact.text + " "),
          source
            ? el("span", { class: "impact-source" }, [
                document.createTextNode("("),
                el("a", { href: source.url, target: "_blank", rel: "noopener noreferrer", text: source.title }),
                document.createTextNode(")"),
              ])
            : null,
        ]);
      })
    ),
  ]);
}

function renderSourceLine(card) {
  const primary = card.sources[0];
  return el("p", { class: "card-source-line" }, [
    el("span", { text: card.official_ref + " · " }),
    primary
      ? el("a", { href: primary.url, target: "_blank", rel: "noopener noreferrer", text: "View source" })
      : document.createTextNode("Source unavailable"),
  ]);
}

function renderFront(card, reaction, onReact) {
  return el("div", {
    class: "card-face card-face-front",
    "aria-hidden": reaction ? null : null,
  }, [
    el("span", { class: "card-section-tag", text: sectionLabel(card) }),
    el("h2", { class: "card-title", text: card.plain_title }),
    el("p", { class: "card-body", text: card.summary }),
    renderImpacts(card),
    el("div", {
      class: "reactions",
      role: "group",
      "aria-label": "Your reaction",
    }, REACTIONS.map((r) =>
      el("button", {
        class: "reaction-btn",
        type: "button",
        "data-reaction": r.id,
        "aria-pressed": String(reaction === r.id),
        text: r.label,
        onclick: () => onReact(r.id),
      })
    )),
    renderSourceLine(card),
  ].filter(Boolean));
}

function sectionLabel(card) {
  return (card.sections && card.sections[0]) || "policy";
}

function renderBack(card, ctx) {
  const { sponsor, testPerson, testVote, boardMembers, onNext, isLast } = ctx;
  const rows = [];

  if (sponsor) {
    rows.push(
      el("div", { class: "reveal-row" }, [
        el("p", { class: "reveal-label", text: card.sponsor_role || "Introduced by" }),
        el("p", { class: "reveal-value" }, [
          document.createTextNode(sponsor.name + " "),
          sponsor.party
            ? el("span", { class: "party-tag", text: sponsor.party })
            : el("span", { class: "impact-source", text: `(${sponsor.party_note || "party affiliation not on record"})` }),
        ]),
      ])
    );
  } else if (card.approving_body) {
    rows.push(
      el("div", { class: "reveal-row" }, [
        el("p", { class: "reveal-label", text: "Approved by" }),
        el("p", { class: "reveal-value", text: card.approving_body }),
      ])
    );
  }

  if (boardMembers && boardMembers.length > 0) {
    rows.push(
      el("div", { class: "reveal-row" }, [
        card.board_note ? el("p", { class: "impact-source", text: card.board_note }) : null,
        el(
          "ul",
          {},
          boardMembers.map((p) =>
            el("li", { class: "recap-line", text: `${p.name} — ${p.office}` })
          )
        ),
      ].filter(Boolean))
    );
  }

  rows.push(
    el("div", { class: "reveal-row" }, [
      el("p", { class: "reveal-label", text: "Status" }),
      el("p", {
        class: "reveal-value",
        text: `${STATUS_LABEL[card.status] || card.status} — ${formatDate(card.status_date)}`,
      }),
    ])
  );

  if (testPerson) {
    rows.push(
      el("div", { class: "reveal-row" }, [
        el("p", { class: "reveal-label", text: `How ${testPerson.name} voted` }),
        el("p", {
          class: "reveal-value",
          text: testVote ? testVote.vote.toUpperCase() : (card.votes_note || "No recorded vote on this item"),
        }),
      ])
    );
  }

  const compareNote = buildCompareNote(ctx);

  return el("div", { class: "card-face card-face-back" }, [
    el("h2", { class: "card-title", text: card.plain_title }),
    ...rows,
    compareNote,
    el("div", { class: "deck-nav" }, [
      el("button", {
        class: "btn",
        type: "button",
        text: isLast ? "Finish" : "Next card",
        onclick: onNext,
      }),
    ]),
  ].filter(Boolean));
}

function buildCompareNote(ctx) {
  const { reaction, testVote } = ctx;
  if (!reaction || !testVote) return null;
  const userSaidYes = reaction === "agree";
  const userSaidNo = reaction === "disagree";
  const repSaidYes = testVote.vote === "yes";
  const repSaidNo = testVote.vote === "no";

  let text;
  if (reaction === "not-sure") {
    text = "You weren't sure. Now you know how your representative voted.";
  } else if ((userSaidYes && repSaidYes) || (userSaidNo && repSaidNo)) {
    text = "Your reaction matches how your representative voted.";
  } else if ((userSaidYes && repSaidNo) || (userSaidNo && repSaidYes)) {
    text = "Your reaction is different from how your representative voted.";
  } else {
    text = "Your representative's vote on this doesn't map cleanly to your reaction.";
  }

  return el("p", { class: "compare-note", text });
}

export function renderCard(container, state) {
  const { card, sponsor, testPerson, testVote, boardMembers, reaction, revealed, index, total, onReact, onNext } = state;
  clear(container);

  const progress = el("div", { class: "progress" }, [
    el("span", { text: `Card ${index + 1} of ${total}` }),
    el("div", { class: "progress-track" }, [
      el("div", {
        class: "progress-fill",
        style: `width:${((index + 1) / total) * 100}%`,
      }),
    ]),
  ]);
  // style attribute isn't handled by el()'s generic setAttribute path issue-free for camelCase,
  // but "style" as a plain attribute string works fine via setAttribute.

  const scene = el("div", { class: "card-scene" }, [
    el(
      "div",
      {
        class: "card-flip" + (revealed ? " is-flipped" : ""),
        role: "group",
        "aria-label": `Policy card ${index + 1} of ${total}`,
      },
      [
        renderFront(card, reaction, onReact),
        revealed ? renderBack(card, { sponsor, testPerson, testVote, boardMembers, reaction, onNext, isLast: index === total - 1 }) : el("div", { class: "card-face card-face-back" }),
      ]
    ),
  ]);

  container.appendChild(progress);
  container.appendChild(scene);

  if (revealed) {
    announce(`Revealed. Introduced by ${sponsor ? sponsor.name : "unknown"}.`);
  }
}
