import { renderIntro } from "./ui/intro.js";
import { renderCard } from "./ui/card.js";
import { renderDone } from "./ui/done.js";

// Phase 1 (PLAN.md §12): hard-coded location. Real street+ZIP lookup against
// bundled district GeoJSON arrives in Phase 2. This id must match a person in
// data/people.json.
const HARD_CODED_LOCATION = {
  label: "a Lincoln City Council District 1 address (example)",
  representativePersonId: "person-lincoln-council-d1",
};

const app = document.getElementById("app");

async function loadData() {
  const [cardsRes, peopleRes] = await Promise.all([
    fetch("data/cards.json"),
    fetch("data/people.json"),
  ]);
  const cards = await cardsRes.json();
  const people = await peopleRes.json();
  const peopleById = new Map(people.map((p) => [p.id, p]));
  return { cards, peopleById };
}

function findVoteFor(card, personId) {
  if (!card.votes || !personId) return null;
  return card.votes.find((v) => v.person_id === personId) || null;
}

async function main() {
  let cards, peopleById;
  try {
    ({ cards, peopleById } = await loadData());
  } catch (err) {
    app.textContent = "Face Value couldn't load its data files. Check the console for details.";
    console.error(err);
    return;
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    app.textContent = "No cards are available right now.";
    return;
  }

  const testPerson = peopleById.get(HARD_CODED_LOCATION.representativePersonId) || null;

  const state = {
    screen: "intro",
    index: 0,
    responses: {}, // cardId -> { reaction, revealed }
  };

  function goIntro() {
    state.screen = "intro";
    state.index = 0;
    state.responses = {};
    render();
  }

  function startDeck() {
    state.screen = "deck";
    state.index = 0;
    render();
  }

  function react(cardId, reaction) {
    const prev = state.responses[cardId] || {};
    state.responses[cardId] = { ...prev, reaction, revealed: true };
    render();
  }

  function next() {
    if (state.index < cards.length - 1) {
      state.index += 1;
      render();
    } else {
      state.screen = "done";
      render();
    }
  }

  function render() {
    if (state.screen === "intro") {
      renderIntro(app, { locationLabel: HARD_CODED_LOCATION.label, onStart: startDeck });
      return;
    }

    if (state.screen === "deck") {
      const card = cards[state.index];
      const sponsor = peopleById.get(card.sponsor_id) || null;
      const boardMembers = (card.board_members || [])
        .map((id) => peopleById.get(id))
        .filter(Boolean);
      const response = state.responses[card.id] || {};
      const testVote = findVoteFor(card, HARD_CODED_LOCATION.representativePersonId);

      renderCard(app, {
        card,
        sponsor,
        testPerson,
        testVote,
        boardMembers,
        reaction: response.reaction || null,
        revealed: Boolean(response.revealed),
        index: state.index,
        total: cards.length,
        onReact: (reaction) => react(card.id, reaction),
        onNext: next,
      });
      return;
    }

    if (state.screen === "done") {
      renderDone(app, { cards, responses: state.responses, onRestart: goIntro });
    }
  }

  render();
}

main();
