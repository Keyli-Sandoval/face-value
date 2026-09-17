# Face Value

A plain-language voter guide. Shows real local policies with the politician's
identity hidden, lets the reader react, then reveals who was behind it and how
it turned out. Course project for ADPR 492 — see [PLAN.md](PLAN.md) for the
full spec and [docs/face-value-source-guide.md](docs/face-value-source-guide.md)
for sourcing and plain-language method.

## Status

**Phase 3 — summary + output.** Eight cards, two filters, no party field.

- Real street+ZIP lookup against bundled Lincoln City Council and Nebraska
  Legislature district boundaries (real GeoJSON from the Lincoln Open Data
  Portal and the Census Bureau's TIGERweb service — see `data/districts/`).
  Never geocodes or sends an address anywhere; everything runs client-side.
- "Find yourself on a map" alternate path using the same boundary data.
- Honest handling of ZIP codes that span more than one district (most Lincoln
  ZIPs do — city council and legislative boundaries don't follow ZIP lines),
  and of ZIP codes outside bundled coverage.
- **Two filters, both optional and multi-select: topic and how local it is**
  (city vs. state, from `jurisdiction_level`). Sections or levels with zero
  matching cards for a given address are hidden rather than shown empty.
- Eight cards across `wages-and-work`, `elections-and-voting`,
  `taxes-and-budget` (×2), `schools`, `housing-and-rent`, and
  `roads-and-transit` — six city-level, two state-level (Nebraska
  Legislature). `housing-and-rent`, `roads-and-transit`, and `schools` were
  added in this pass; `policing-and-courts` and `water-and-land` stay empty
  (and hidden) until a card for them clears the same neutral-wording bar as
  the deliberately-excluded Fairness Ordinance card (PLAN.md §11).
- **No party field.** Every official currently in `people.json` holds an
  officially nonpartisan office, so the reveal shows who and what body, never
  a party — see PLAN.md §9 for the reasoning if that needs revisiting later.
- **Summary screen works:** a full recap of every card you reacted to, with
  your reaction, who was behind it, the outcome, how your rep voted if known,
  and the source link. "Print / Save as PDF" uses a scoped print stylesheet
  that hides interactive chrome and prints source URLs inline. "Copy as text"
  uses the Clipboard API with a visible, pre-selected textarea fallback for
  contexts (like a sandboxed iframe) where that API is blocked.
- Jurisdiction-agnostic by design: a second city or state is new JSON +
  GeoJSON files, not new code (see `data/districts/lincoln.json`'s layer
  structure).

Not yet built: iframe embed packaging, the methodology page, and an
accessibility/production polish pass (Phase 4).

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
rules in the source guide. District boundary data lives in
[`data/districts/lincoln.json`](data/districts/lincoln.json), built from real
GeoJSON by `scripts/build-districts.py` scratch tooling (regenerate by editing
the layer list at the top of that script, not by hand-editing the JSON).

Validate before committing changes (requires Node — not installed on every
dev machine; this repo's 8-card data was last checked with a scratch Python
port of these same two scripts' rules, since Node wasn't available here. Run
the real scripts below once Node is available):

```bash
node scripts/validate.js
node scripts/readability.js
```

`validate.js` fails loudly on duplicate keys, missing sources, dangling
person references, or a card missing both `sponsor_id` and `approving_body`.
`readability.js` reports each card's Flesch-Kincaid grade level (target:
below 8); pass `--write` to store the score on each card.

## Privacy

Address handling is client-side only — see PLAN.md §5. Non-negotiable.
Verify in the browser network tab: only requests to your own dev server
should ever appear, regardless of what street/ZIP you type in.
