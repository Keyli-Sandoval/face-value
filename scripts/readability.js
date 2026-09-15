#!/usr/bin/env node
// Computes Flesch-Kincaid grade level per card. See PLAN.md §10.
// Run: node scripts/readability.js         (report only)
//      node scripts/readability.js --write (also writes readability_grade into cards.json)

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const CARDS_PATH = path.join(DATA_DIR, "cards.json");
const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function fleschKincaidGrade(text) {
  const sentences = (text.match(/[.!?]+(\s|$)/g) || []).length || 1;
  const words = (text.match(/[A-Za-z'-]+/g) || []);
  const wordCount = words.length || 1;
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const grade = 0.39 * (wordCount / sentences) + 11.8 * (syllableCount / wordCount) - 15.59;
  return Math.max(0, Math.round(grade * 10) / 10);
}

function cardText(card) {
  const parts = [card.plain_title, card.summary];
  for (const impact of card.impacts || []) parts.push(impact.text);
  if (card.fiscal && card.fiscal.text) parts.push(card.fiscal.text);
  return parts.filter(Boolean).join(" ");
}

const shouldWrite = process.argv.includes("--write");
let total = 0;

console.log("Readability (Flesch-Kincaid grade level):\n");
for (const card of cards) {
  const grade = fleschKincaidGrade(cardText(card));
  total += grade;
  console.log(`  ${grade.toFixed(1).padStart(4)}  ${card.id}`);
  if (shouldWrite) card.readability_grade = grade;
}

console.log(`\nAverage grade: ${(total / cards.length).toFixed(1)} (target: below 8)`);

if (shouldWrite) {
  fs.writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2) + "\n");
  console.log(`\nWrote readability_grade into ${path.relative(process.cwd(), CARDS_PATH)}`);
}
