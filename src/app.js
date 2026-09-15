import { renderIntro } from "./ui/intro.js";
import { renderLocation } from "./ui/location.js";
import { renderSections } from "./ui/sections.js";
import { renderCard } from "./ui/card.js";
import { renderDone } from "./ui/done.js";
import { loadDistrictLayers } from "./geo/district-lookup.js";

// Fallback used if a ZIP isn't in our bundled coverage, or as the very first
// thing shown before any real lookup runs. See PLAN.md §6 step 2: "if
// outside coverage, say so honestly and offer Lincoln as an example."
const EXAMPLE_LOCATION_LABEL = "a Lincoln City Council District 1 address";
const EXAMPLE_RESOLVED = {
  council: { feature: { properties: { name: "District 1", person_id: "person-lincoln-council-d1" } }, level: "city", label: "City Council district" },
  legislature: { feature: { properties: { name: "District 26", person_id: "person-ne-senator-d26" } }, level: "state", label: "Legislative district" },
};

const app = document.getElementById("app");

async function loadData() {
  const [cardsRes, peopleRes, sectionsRes] = await Promise.all([
    fetch("data/cards.json"),
    fetch("data/people.json"),
    fetch("data/sections.json"),
  ]);
  const cards = await cardsRes.json();
  const people = await peopleRes.json();
  const sections = await sectionsRes.json();
  const peopleById = new Map(people.map((p) => [p.id, p]));
  return { cards, peopleById, sections };
}

function personIdForCard(card, resolvedLocation) {
  if (!resolvedLocation) return null;
  if (card.jurisdiction_level === "state") {
    return resolvedLocation.legislature?.feature?.properties?.person_id || null;
  }
  return resolvedLocation.council?.feature?.properties?.person_id || null;
}

function cardAppliesToLocation(card, resolvedLocation) {
  if (!card.applies_to_district) return true;
  const { layer, district } = card.applies_to_district;
  return resolvedLocation?.[layer]?.feature?.properties?.name === district;
}

function findVoteFor(card, personId) {
  if (!card.votes || !personId) return null;
  return card.votes.find((v) => v.person_id === personId) || null;
}

async function main() {
  let cards, peopleById, sections, districtLayers;
  try {
    ({ cards, peopleById, sections } = await loadData());
  } catch (err) {
    app.textContent = "Face Value couldn't load its data files. Check the console for details.";
    console.error(err);
    return;
  }

  try {
    districtLayers = await loadDistrictLayers("lincoln");
  } catch (err) {
    console.warn("District boundary data unavailable, location lookup will be limited:", err);
    districtLayers = null;
  }

  const state = {
    screen: "intro",
    resolvedLocation: null,
    selectedSections: new Set(),
    index: 0,
    responses: {},
  };

  function goIntro() {
    state.screen = "intro";
    state.resolvedLocation = null;
    state.selectedSections = new Set();
    state.index = 0;
    state.responses = {};
    render();
  }

  function goLocation() {
    state.screen = "location";
    render();
  }

  function handleResolved(resolvedLocation) {
    state.resolvedLocation = resolvedLocation;
    state.screen = "sections";
    render();
  }

  function useExample() {
    handleResolved(EXAMPLE_RESOLVED);
  }

  function visibleCards() {
    return cards.filter((card) => {
      if (!cardAppliesToLocation(card, state.resolvedLocation)) return false;
      if (state.selectedSections.size === 0) return true;
      return (card.sections || []).some((s) => state.selectedSections.has(s));
    });
  }

  function toggleSection(id) {
    if (state.selectedSections.has(id)) state.selectedSections.delete(id);
    else state.selectedSections.add(id);
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

  function next(deck) {
    if (state.index < deck.length - 1) {
      state.index += 1;
      render();
    } else {
      state.screen = "done";
      render();
    }
  }

  function render() {
    if (state.screen === "intro") {
      renderIntro(app, { onStart: goLocation });
      return;
    }

    if (state.screen === "location") {
      if (!districtLayers) {
        // Honest degraded path: no bundled boundary data available, so we
        // can't do a real lookup. Offer the example rather than fabricate one.
        renderLocation(app, {
          layers: { layers: [], zipCentroids: {}, zipDistricts: {} },
          exampleLabel: EXAMPLE_LOCATION_LABEL,
          onResolved: handleResolved,
          onUseExample: useExample,
        });
        return;
      }
      renderLocation(app, {
        layers: districtLayers,
        exampleLabel: EXAMPLE_LOCATION_LABEL,
        onResolved: handleResolved,
        onUseExample: useExample,
      });
      return;
    }

    if (state.screen === "sections") {
      const inCoverage = cards.filter((c) => cardAppliesToLocation(c, state.resolvedLocation));
      const cardsBySection = new Map();
      for (const card of inCoverage) {
        for (const s of card.sections || []) {
          cardsBySection.set(s, (cardsBySection.get(s) || 0) + 1);
        }
      }
      renderSections(app, {
        sections,
        cardsBySection,
        selected: state.selectedSections,
        onToggle: toggleSection,
        onContinue: startDeck,
        onSkip: () => { state.selectedSections = new Set(); startDeck(); },
      });
      return;
    }

    if (state.screen === "deck") {
      const deck = visibleCards();
      if (deck.length === 0) {
        app.textContent = "No cards match what you picked. Go back and choose different sections.";
        return;
      }
      const card = deck[state.index];
      const sponsor = peopleById.get(card.sponsor_id) || null;
      const boardMembers = (card.board_members || [])
        .map((id) => peopleById.get(id))
        .filter(Boolean);
      const response = state.responses[card.id] || {};
      const testPersonId = personIdForCard(card, state.resolvedLocation);
      const testPerson = peopleById.get(testPersonId) || null;
      const testVote = findVoteFor(card, testPersonId);

      renderCard(app, {
        card,
        sponsor,
        testPerson,
        testVote,
        boardMembers,
        reaction: response.reaction || null,
        revealed: Boolean(response.revealed),
        index: state.index,
        total: deck.length,
        onReact: (reaction) => react(card.id, reaction),
        onNext: () => next(deck),
      });
      return;
    }

    if (state.screen === "done") {
      renderDone(app, { cards: visibleCards(), responses: state.responses, onRestart: goIntro });
    }
  }

  render();
}

main();
