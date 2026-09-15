#!/usr/bin/env node
// Fails loudly on bad content data. See PLAN.md §9.
// Run: node scripts/validate.js

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const cards = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "cards.json"), "utf8"));
const people = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "people.json"), "utf8"));
const peopleIds = new Set(people.map((p) => p.id));

const errors = [];
const seenKeys = new Set();

for (const card of cards) {
  const label = card.id || "(missing id)";
  const key = `${card.jurisdiction}::${card.official_ref}`;

  if (!card.id) errors.push(`Card missing "id".`);
  if (!card.jurisdiction) errors.push(`${label}: missing "jurisdiction".`);
  if (!card.official_ref) errors.push(`${label}: missing "official_ref".`);

  if (seenKeys.has(key)) {
    errors.push(`${label}: duplicate jurisdiction+official_ref key "${key}".`);
  }
  seenKeys.add(key);

  if (!card.sources || card.sources.length === 0) {
    errors.push(`${label}: has zero sources.`);
  }

  const sourceIds = new Set((card.sources || []).map((s) => s.id));
  for (const impact of card.impacts || []) {
    if (!impact.source_id) {
      errors.push(`${label}: an impact is missing "source_id" — ("${impact.text?.slice(0, 40)}...")`);
    } else if (!sourceIds.has(impact.source_id)) {
      errors.push(`${label}: impact source_id "${impact.source_id}" not found in this card's sources.`);
    }
  }

  if (card.fiscal && card.fiscal.source_id && !sourceIds.has(card.fiscal.source_id)) {
    errors.push(`${label}: fiscal.source_id "${card.fiscal.source_id}" not found in this card's sources.`);
  }

  if (card.sponsor_id && !peopleIds.has(card.sponsor_id)) {
    errors.push(`${label}: sponsor_id "${card.sponsor_id}" not found in people.json.`);
  }

  for (const vote of card.votes || []) {
    if (!peopleIds.has(vote.person_id)) {
      errors.push(`${label}: vote references person_id "${vote.person_id}" not found in people.json.`);
    }
  }

  for (const personId of card.board_members || []) {
    if (!peopleIds.has(personId)) {
      errors.push(`${label}: board_members references "${personId}" not found in people.json.`);
    }
  }

  if (!card.sponsor_id && !card.approving_body) {
    errors.push(`${label}: has neither "sponsor_id" nor "approving_body" — the reveal needs one.`);
  }

  if (!card.reviewed_by) {
    errors.push(`${label}: missing "reviewed_by".`);
  }

  if (!card.sections || card.sections.length === 0) {
    errors.push(`${label}: has no sections assigned.`);
  }
}

if (errors.length > 0) {
  console.error(`\nValidation FAILED — ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

console.log(`Validation passed. ${cards.length} card(s), ${people.length} people.`);
