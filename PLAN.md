# Face Value
### A plain-language voter guide

> Working plan for an AI coding agent. Read this file completely before writing code.
> Course project: ADPR 492. Target: working demo with feedback in 2–3 days.
> Build phases in §10 in order. Ship each one working before starting the next.

## 1. What this is

A policy-first voter education widget. A user enters their street and ZIP, picks the
issues they care about, and is shown real local policies **in plain language with the
politician hidden**. They react (agree / disagree / not sure). Only then does the card
flip to reveal who introduced it, their party, how the user's own representatives voted,
and whether it passed.

The goal is to let new and unsure voters form a judgment on the substance before the
identity cue arrives without bias and without shaming them for not already knowing.

Primary geography: **Lincoln, Nebraska.** Architecture must be jurisdiction-agnostic so
another city or state can be added by supplying new data files, not new code.

Delivery: a **self-contained embeddable widget** a local newsroom can drop onto its site
before an election with one iframe snippet.

## 2. Non-goals

Be strict about these. They are the most common ways this project would fail.

- **Never recommends a candidate or a vote.** It shows what the user said and what
  officials did. The user draws the line.
- **No accounts, no login, no email collection, ever.** Not optional, not "later."
- **No user tracking that could identify a person**, and no third-party analytics or ad
  scripts in the widget.
- **No live data pipeline in the demo.** Content is hand-curated in a data file.
- Not a ballot lookup tool. Tools like The Ballot Brief already answer "who is on my
  ballot." This answers "what did they do, and what do I think about it."

## 3. Success criteria (definition of done for the demo)

1. A user can complete a full session. Structed like this. location, sections, more or equal to 5 cards, reveal reveal, and then grants a summary of what just hapened. Should at most be a 5 minute process total. 
2. Every card's claims link to a real primary source. No invented content anywhere.
3. The user's location never leaves their browser. Verifiable in the network tab.
4. The summary can be printed / saved as PDF and copied as plain text.
5. Loads inside an iframe on a third-party page without breaking its layout.
6. Average card readability less than grade 8 (Flesch-Kincaid), computed and reported.
7. A test reader cannot guess a policy's political side before the flip more often
   than chance.

## 4. Tech stack

**Plain HTML, CSS, and JavaScript. No framework, no build step, no bundler.**

Rationale: the deliverable is an embeddable widget. A framework adds weight and a build
pipeline for no benefit here, and a newsroom developer should be able to open the source
and understand it in five minutes.

- ES modules, no transpilation. Modern browsers only.
- No runtime dependencies. If a small library is genuinely needed (e.g. point-in-polygon),
  vendor a single file into `/src/vendor/` rather than adding a package manager.
- Node is used only for dev-time scripts in `/scripts/` (validation, readability). The
  shipped app must run by opening `index.html`.

## 5. Hard constraints

### Privacy (non-negotiable)
- Address handling is **client-side only.** Bundle district boundary GeoJSON with the
  app and run point-in-polygon in the browser. The address must never be sent to any
  server, including third-party geocoders, for covered areas.
- Ask for **street name + ZIP. Never ask for a house number.**
- Do not use the browser Geolocation API.
- Reactions live in memory / `sessionStorage` only. Nothing persists after the tab closes.
- Display the privacy statement *before* the location input, not behind a link.
- THIS IS NON NEGOTIABLE

### Technical
- Static site. No backend, no database, no server functions.
- Must work embedded in an iframe and inherit sensible sizing.
- Mobile-first. Most users will be on a phone.
- Accessible: full keyboard navigation, screen-reader labels, visible focus states,
  WCAG AA contrast. Do not convey the reveal by color alone.
- No external network calls at runtime for covered areas.

## 6. User flow

1. **Intro** - one screen. What this is, and the privacy statement in plain words.
2. **Location** - street name + ZIP. Alternate path: "find yourself on the map."
   If the street crosses a district boundary, ask ONE clarifying question
   (e.g. "north or south of O Street?"). If outside coverage, say so honestly and
   offer Lincoln as an example. **Never fabricate content for uncovered areas.**
3. **Sections** - multi-select issue picker, skippable.
4. **Card deck** - one policy per screen.
5. **Reveal** - reveals the politician 
6. **Official profile** - optional, reachable from a reveal.
7. **Summary** - everything they answered. Print / save PDF / copy as text.
8. **Methodology** - linked from every screen. Sources, selection rule, who reviewed,
   what the AI did and did not do.
9. **Crediting** - every card should have a quick source if availible at the bottom or top right.

## 7. The card

### Front (politician hidden)
- Plain-language title, under 12 words, describing the change. **Never leads with a
  bill or ordinance number.**
- "What it does" - 3-4 sentences: what the rule is now, what it becomes, who it covers.
- **Collapsible dropdown: "What this policy means for me"** - 2-3 concrete effects for a
  typical Lincoln resident. Dollar figures from official fiscal analysis. Each item
  traceable to a source line.
- Reaction control: Agree / Disagree / Not sure.
- Official reference number and source link: visible but low-emphasis. **Sourcing is
  never hidden - only the person is.**

### Back (after reaction)
- Who introduced it, **and their party affiliation.**
- Outcome and date: passed / failed / pending / blocked in court.
- How the user's own representative voted.
- How the user's reaction compares to that vote - stated neutrally, never "gotcha."
- Link to the official's full profile.

## 8. Issue sections

Fixed list of eight. Named for life, not for government committees.

| id | label |
|---|---|
| `housing-and-rent` | Housing and rent |
| `wages-and-work` | Wages and work |
| `schools` | Schools |
| `policing-and-courts` | Policing and courts |
| `roads-and-transit` | Roads and transit |
| `taxes-and-budget` | Taxes and city budget |
| `water-and-land` | Water and land |
| `elections-and-voting` | Elections and voting |

Do not add sections that have no cards. Hide any section with zero matching cards
rather than showing an empty result.

## 9. Data model

Two data files. Content is authored by hand and reviewed by a human before it ships.

```json
// cards.json
{
  "id": "lnk-min-wage-2026",
  "jurisdiction": "lincoln-city",
  "official_ref": "Ordinance 21234",
  "plain_title": "Restore yearly minimum wage increases tied to inflation",
  "summary": "...",
  "impacts": [
    { "text": "...", "source_id": "src-2" }
  ],
  "fiscal": { "text": "...", "source_id": "src-3" },
  "sections": ["wages-and-work"],
  "status": "blocked-in-court",
  "status_date": "2026-06-18",
  "sponsor_id": "person-xx",
  "votes": [
    { "person_id": "person-xx", "stage": "final", "vote": "yes" }
  ],
  "sources": [
    { "id": "src-1", "title": "...", "url": "..." }
  ],
  "reviewed_by": "Keyli",
  "reviewed_at": "2026-09-10",
  "readability_grade": 7.6
}
```

```json
// people.json
{
  "id": "person-xx",
  "name": "...",
  "office": "Lincoln City Council",
  "district": "3",
  "jurisdiction": "lincoln-city",
  "party": "...",
  "term_start": "2025-05",
  "sources": ["..."]
}
```

### Deduplication (required)
`jurisdiction + official_ref` is the unique key. Add a validation script that runs on
build and **fails loudly** on: duplicate keys, a card with zero sources, an impact with
no `source_id`, a `sponsor_id` or `person_id` not present in `people.json`, or a missing
`reviewed_by`. A card that fails validation must not render.

## 10. Content rules

Sources and method are specified in **`face-value-source-guide.md`** in the ADPR 492
folder. Read it before authoring any card. Summary of the rules that bind the code and
the content:

- Claims trace to primary records (official votes, bill text, fiscal notes). Local news
  is used to *find* stories, never as the source of a claim.
- Banned vocabulary in all card text: harmful, beneficial, common-sense, extreme,
  reasonable, dangerous, long-overdue, controversial. No predictions about elections.
  No claims about anyone's motives.
- Never simplify away: the number, the date, the who, or the uncertainty. If a cost is
  unknown, the card says it is unknown.
- Target grade 8 readability. Store the score on each card.
- Two-question comprehension check per card before it ships: "What would change if this
  passed?" and "Who was behind it?" The second must be unanswerable before the flip.

## 11. First cards

Build Phase 1 on these four. All are real, current, and documented.

1. **Lincoln minimum wage.** Voters approved $15; the council voted to restore
   inflation-based increases; the state Attorney General sued; a judge issued an
   injunction. Section: `wages-and-work`.
2. **Lincoln city charter amendment petitions.** Three petitions to move city elections
   to even years, add council term limits, and extend the vote to residents of the
   three-mile extraterritorial zone. The city attorney ruled them late for the Nov. 3
   ballot; the Nebraska Supreme Court ordered the city to certify or justify refusing.
   Section: `elections-and-voting`.
3. **Lincoln Airport Authority and Red Way.** An elected board most residents don't know
   they elect, a costly airline venture, a state auditor's report.
   Section: `taxes-and-budget`.
4. **One deliberately unglamorous item** — a budget line, zoning change, or bond.
   Most governing is boring, and a deck of only fights misrepresents these offices.
   Section: `taxes-and-budget` or `housing-and-rent`.

**Deliberately excluded for now:** the 4–3 council vote rescinding the Fairness
Ordinance. Structurally it is the ideal reveal card, but it is the hardest test of
neutral wording. Add it only after the comprehension check in §10 has passed cleanly on
the four above. This is a decision, not an oversight.

## 12. Build phases

**Phase 1 — Core loop.** Card deck, reaction, flip, hard-coded location. The four cards
in §11.
*Done when:* a person can react to a card and see a correct reveal on a phone.

**Phase 2 — Location + sections.** Street+ZIP lookup against bundled GeoJSON, clarifying
question, honest out-of-area path, section filter.
*Done when:* two different Lincoln addresses produce different representatives, and the
network tab shows no address ever leaving the browser.

**Phase 3 — Summary + output.** Summary screen, print stylesheet, copy-as-text.
*Done when:* the printed page is legible on one sheet and readable at a kitchen table.

**Phase 4 — Embed + polish.** iframe packaging, methodology page, official profiles,
accessibility pass, validation script.
*Done when:* it runs correctly embedded in a plain test HTML page.

## 13. Repo structure

```
/index.html
/src/
  app.js
  ui/            screen modules
  geo/           point-in-polygon + district lookup
  vendor/        any single-file dependency
/data/
  cards.json
  people.json
  sections.json
  districts/*.geojson
/scripts/
  validate.js       fails build on bad data
  readability.js    computes grade level per card
/public/embed.html  iframe entry point
/docs/
  methodology.md
  face-value-source-guide.md
```

## 14. Open questions

- Which specific budget or zoning item becomes card #4.
- Whether the demo also carries Nebraska state-legislature cards for Lincoln's ten
  districts (2, 21, 25, 26, 27, 28, 29, 30, 32, 46). **Default assumption: yes, in a
  later phase.** State bills are identical statewide — only "how your senator voted"
  changes — so the state layer expands to all of Nebraska at almost no extra cost.
- Exact street thresholds for the clarifying question in §6, step 2.

## Resources

- `face-value-source-guide.md` — full source list and plain-language method (ADPR 492 folder)
- Lincoln Open Data Portal — district boundary GeoJSON: https://opendata.lincoln.ne.gov/
- Lincoln City Council minutes & agendas: https://www.lincoln.ne.gov/City/City-Council/Minutes-Agendas
- Lancaster County Election Commissioner: https://www.lancaster.ne.gov/314/Election-Commissioner
- Nebraska Legislature: https://nebraskalegislature.gov/
- LegiScan API (state bills and votes): https://legiscan.com/legiscan
- Unicameral Update (plain-language bill summaries): https://update.legislature.ne.gov/
- VOTE411 / League of Women Voters Lincoln-Lancaster: https://lincolnleague.org/
- Flatwater Free Press Nebraska Voter Guide: https://voterguide.flatwaterfreepress.org/
- Center for Civic Design, plain language: https://civicdesign.org/topics/plain-language/