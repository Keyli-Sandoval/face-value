# Face Value

A plain-language voter guide. Shows real local policies with the politician's
identity hidden, lets the reader react, then reveals who was behind it and how
it turned out. Course project for ADPR 492 — see [PLAN.md](PLAN.md) for the
full spec and [docs/face-value-source-guide.md](docs/face-value-source-guide.md)
for sourcing and plain-language method.

## Status

**Phase 1 — core loop.** Card deck, reaction, flip reveal, hard-coded location.
No address lookup, section filter, summary/print, or embed packaging yet
(Phases 2–4).

## Running it locally

Plain HTML/CSS/JS, no build step. Because it loads data via `fetch()`, it
needs to be served over `http://`, not opened directly as a `file://` URL.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Data

Content lives in [`data/cards.json`](data/cards.json) and
[`data/people.json`](data/people.json), hand-authored and sourced per the
rules in the source guide. Validate before committing changes:

```bash
node scripts/validate.js
node scripts/readability.js
```

`validate.js` fails loudly on duplicate keys, missing sources, or dangling
person references. `readability.js` reports each card's Flesch-Kincaid grade
level (target: below 8); pass `--write` to store the score on each card.

## Privacy

Address handling is client-side only — see PLAN.md §5. Non-negotiable.
