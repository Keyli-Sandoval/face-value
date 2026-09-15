# Face Value

A plain-language voter guide. Shows real local policies with the politician's
identity hidden, lets the reader react, then reveals who was behind it and how
it turned out. Course project for ADPR 492 — see [PLAN.md](PLAN.md) for the
full spec and [docs/face-value-source-guide.md](docs/face-value-source-guide.md)
for sourcing and plain-language method.

## Status

**Phase 2 — location, sections, and multiple levels of government.**

- Real street+ZIP lookup against bundled Lincoln City Council and Nebraska
  Legislature district boundaries (real GeoJSON from the Lincoln Open Data
  Portal and the Census Bureau's TIGERweb service — see `data/districts/`).
  Never geocodes or sends an address anywhere; everything runs client-side.
- "Find yourself on a map" alternate path using the same boundary data.
- Honest handling of ZIP codes that span more than one district (most Lincoln
  ZIPs do — city council and legislative boundaries don't follow ZIP lines),
  and of ZIP codes outside bundled coverage.
- Multi-select issue-section filter; sections with zero matching cards for a
  given address are hidden.
- Cards are tagged by level of government (`city` or `state`) and, for
  personalized state cards, restricted to the specific legislative district
  they apply to — proving the "local to bigger" architecture with a real
  Nebraska Legislature bill (LB22) tied to District 26, without needing to
  hand-author every district.
- Jurisdiction-agnostic by design: a second city or state is new JSON +
  GeoJSON files, not new code (see `data/districts/lincoln.json`'s layer
  structure).

Not yet built: printable/copyable summary screen, iframe embed packaging, the
methodology page, and an accessibility/production polish pass (Phase 3–4).

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
dev machine, so this repo's data was last checked by hand with `jq`; run
these for real once Node is available):

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
