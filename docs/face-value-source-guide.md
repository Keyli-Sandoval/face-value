# Face Value — Source Guide & Plain Language Method

*Where to get Lincoln election and policy information, and how to turn it into something a 22-year-old will actually read.*

---

# PART 1 — Where to get everything

Sources are grouped by how you're allowed to use them. This distinction matters more than the list itself: **Tier 1 is what your card's claims must trace to. Tier 2 is a shortcut for writing. Tier 3 is for finding stories, never for claims.** Keeping these separate is what lets you say your summaries are sourced without that being a claim about someone else's neutrality.

## Tier 1 — The official record

**[Lancaster County Election Commissioner](https://www.lancaster.ne.gov/314/Election-Commissioner)** — the authority for anything Lincoln votes on. Past election results, polling places, maps of local political subdivisions, and the names and addresses of elected officials. Their [2026 general election page](https://www.lancaster.ne.gov/1337/2026-Nebraska-Statewide-General-Election) is where ballot-specific material lands, and they publish results reports as documents (their [May 2025 Lincoln city results](https://www.lancaster.ne.gov/DocumentCenter/View/28006/LG2505-Election-Day-1-05_06) are a good example of the format).

*Honest note:* their site doesn't clearly advertise a candidate filing list or sample ballots. Call or email the office and ask — election offices are generally helpful to students, and one email likely gets you a clean candidate list you'd otherwise spend hours assembling.

**[Nebraska Secretary of State — Elections](https://sos.nebraska.gov/elections)** — statewide filings, ballot measure certifications, and the invaluable [Elected Offices and Maps document](https://sos.nebraska.gov/sites/default/files/doc/2024%20Elected%20Offices%20and%20Maps_0.pdf), which is the complete inventory of what Nebraskans actually elect. If you want the list of offices nobody knows they vote for, it's this PDF.

**[Lincoln City Council — Minutes & Agendas](https://www.lincoln.ne.gov/City/City-Council/Minutes-Agendas)** and the older [agenda archive](https://app.lincoln.ne.gov/city/council/common/index.htm) — this is where city votes live. It is the most important source for your local cards and the most annoying to work with, because it's documents rather than data.

**[Lincoln Open Data Portal](https://opendata.lincoln.ne.gov/)** — district boundaries (including [legislative districts with voting districts](https://opendata.lincoln.ne.gov/documents/LincolnNE::legislative-districts-with-voting-districts/explore), which is what powers your ZIP lookup) and a [City Council agenda & minutes dataset](https://opendata.lincoln.ne.gov/datasets/5a37e99e1f4e439b8effb6145fe0dc19).

*Worth an hour of your time:* open that agenda dataset and find out whether it's structured records with fields, or just a table of links to PDFs. If it's structured, city-level automation becomes realistic and that changes your build. I couldn't determine it from the metadata — you'll need to click through and look.

**[Nebraska Legislature](https://nebraskalegislature.gov/)** — for the state layer. Per bill you get the text, a committee statement, a [fiscal note](https://nebraskalegislature.gov/divisions/fiscal.php) with three independent cost estimates, transcribed hearing testimony, and recorded votes at three stages. The [senator roster](https://nebraskalegislature.gov/pdf/senators/roster.pdf) and the [Lancaster County area senators list](https://www.lancaster.ne.gov/DocumentCenter/View/10404/Lancaster-County-Area-State-Senators) cover your ten Lincoln districts.

**[LegiScan API](https://legiscan.com/legiscan)** — the same state data, structured as JSON, free up to 30,000 queries a month. Use this rather than scraping.

**[Nebraska Accountability and Disclosure Commission](https://nadc.nebraska.gov/)** — campaign finance and personal financial disclosures, searchable [here](https://nadc-e.nebraska.gov/PublicSite/Search.aspx). This is the "who paid for this" layer. It's optional for v1, but a single line on a reveal — *"largest donors: X, Y, Z"* — is one of the highest-impact things you can add later, and it's public record.

## Tier 2 — Already simplified, nonpartisan

These have done part of your translation work already. Use them as a reference and cross-check, always with attribution — never as the only source behind a claim.

**[Unicameral Update](https://update.legislature.ne.gov/)** — the Legislature's own news service, writing plain-language explainers of bills as they move. Government-published, which means it's about as close to a neutral summary as exists.

**[VOTE411](https://www.vote411.org/) and the [League of Women Voters Lincoln/Lancaster](https://lincolnleague.org/)** — this is your single best answer to the candidates-with-no-record problem. LWVLL runs VOTE411 guides for [Lincoln city elections](https://lincolnleague.org/vote411-spring-2025/) and [ballot initiatives](https://lincolnleague.org/vote411-ballot-initiatives/) specifically — identical questions to every candidate, verbatim answers, non-responses marked. They also run candidate forums and post a forum protocol.

**Email them.** They are a volunteer organization whose entire mission is what you're building, in your city. Best case they share data or partner; worst case you get an hour of expert conversation about how they handle neutrality, which is course-paper material on its own.

**[Flatwater Free Press — Nebraska Voter Guide](https://voterguide.flatwaterfreepress.org/)** — a nonprofit newsroom's guide covering Lincoln city council, LPS board, Airport Authority, and local measures, with real explanation of what each office does. Also your most likely newsroom partner for the embed.

**[Ballotpedia](https://ballotpedia.org/)** — broad coverage, useful for cross-checking officeholders and measure histories.

## Tier 3 — For finding stories only

The Nebraska Examiner, Lincoln Journal Star, Nebraska Public Media, 1011 Now, and KLKN are how you discover which policies are worth a card. Every strong card candidate in your spec surfaced this way. But the card's claims trace to Tier 1 — you use the article to learn the minimum wage fight happened, then you get the vote from the council record and the dollar figures from the ordinance.

## Two emails worth sending this week

The Lancaster County Election Commissioner, asking for the candidate list and whether sample ballots are published in any structured format. And the League of Women Voters Lincoln/Lancaster, introducing your project. Both are low-effort, high-yield, and both are the kind of primary-source legwork that reads well in a course write-up.

---

# PART 2 — Turning it into simple language

## Set a target you can measure

Aim for an **eighth-grade reading level, measured by Flesch-Kincaid.** That's not arbitrary — Arkansas legally prohibits certifying a ballot title above eighth grade, and Rhode Island and New York require the same standard for ballot questions.

**Nebraska has no readability law at all.** That's a real finding, and it's the cleanest one-sentence argument for why your project should exist here: the state sets no floor for how understandable its ballot language has to be. Cite it in your pitch.

Practically: run every card through a readability checker before it ships. Hemingway Editor is free and instant; a Flesch-Kincaid score is a single formula you can compute in code and store on the card. Then report it — *"average card reads at grade 7.8"* — because a measurable quality claim is worth ten adjectives.

## The rules that actually do the work

The Center for Civic Design has spent years on exactly this problem for election materials. Their guidance, adapted for your cards:

Use the words your readers use, not the words the document uses. One idea per sentence. Short, common words. Active voice and normal word order. Address the reader as "you." Say "if" before "then." Pick one term for a thing and never switch to a synonym — if it's "the council," it's always "the council," never "the body" or "the chamber." Replace "shall" with "must." And test what you wrote on real people, which they list as a step, not a nicety.

Two of my own to add. **Never open with the bill number** — "LB 123 would amend section 77-2701" tells a reader nothing, while "Landlords could charge a monthly fee instead of a security deposit" tells them everything. And **lead with the change, not the mechanism**: readers care what becomes different, not which statute is being amended.

## The card template

Fixed slots force consistency and make bias easier to spot, so write to a template rather than freehand:

**Title** — one line, under twelve words, what changes. No bill or ordinance number.

**What it does** — three to four sentences. What the rule is now, what it would become, and who it applies to.

**What changes for you** — two or three concrete items, each traceable to a specific line in a source document. Dollar figures from the fiscal note. Who's covered, from the text itself. What the public record shows about support and opposition at the hearing.

**Status** — passed, failed, still pending, or blocked in court, with the date.

**Sources** — every document behind the card, linked.

## What never gets simplified away

Simplification is where accuracy quietly dies, so protect four things: the **number** (a dollar figure or percentage is never rounded into "a lot"), the **date**, the **who** (which body, which vote, which stage), and the **uncertainty** (if the fiscal note says "indeterminate," the card says the cost is unknown — it does not guess and it does not omit).

## How the AI fits

Give the model only the official documents for one policy and ask for the template's slots. No web search while drafting. Every item in "what changes for you" must quote or cite a specific line, and anything it can't cite gets left out rather than filled in.

Ban the vocabulary explicitly in the prompt: harmful, beneficial, common-sense, extreme, reasonable, dangerous, long-overdue, controversial, and any prediction about elections or motives. A useful trick is to have the model output its citation alongside each claim, then strip the citations for display but keep them stored — if it can't produce one, that's your signal the claim was invented.

## The check that matters

Readability scores tell you the sentences are short. They don't tell you the card is *understood*. So before a card ships, hand it to someone outside the project and ask two questions: **"What would change if this passed?"** and **"Who was behind it?"** — the second before the reveal.

If they answer the first correctly, the card works. If they can answer the second, your wording is leaking the political side and needs a rewrite. Run that test on every card at demo scale, and record the results. That's not just quality control; it's the evidence base for the claim your whole project rests on.

## Per-card workflow, start to finish

Find the story in Tier 3 reporting. Pull the primary documents from Tier 1. Check whether Tier 2 has already written a neutral summary you can compare against. Draft to the template with the AI, restricted to those documents. Score it for readability and revise to eighth grade. Run the two-question comprehension test on a person. Record the reviewer and date on the card. Ship it.

At fifteen to twenty cards, that's a few evenings of work, and every step of it is defensible in writing — which for a course project is worth as much as the app itself.

---

**Sources**

- [Lancaster County Election Commissioner](https://www.lancaster.ne.gov/314/Election-Commissioner)
- [Lancaster County — 2026 Nebraska Statewide General Election](https://www.lancaster.ne.gov/1337/2026-Nebraska-Statewide-General-Election)
- [Lancaster County — Area State Senators](https://www.lancaster.ne.gov/DocumentCenter/View/10404/Lancaster-County-Area-State-Senators)
- [Nebraska Secretary of State — Elections](https://sos.nebraska.gov/elections)
- [Nebraska Secretary of State — Elected Offices and Maps](https://sos.nebraska.gov/sites/default/files/doc/2024%20Elected%20Offices%20and%20Maps_0.pdf)
- [Lincoln City Council — Minutes & Agendas](https://www.lincoln.ne.gov/City/City-Council/Minutes-Agendas)
- [Lincoln City Council — agenda archive](https://app.lincoln.ne.gov/city/council/common/index.htm)
- [Lincoln Open Data Portal](https://opendata.lincoln.ne.gov/)
- [Lincoln Open Data — City Council agenda & minutes dataset](https://opendata.lincoln.ne.gov/datasets/5a37e99e1f4e439b8effb6145fe0dc19)
- [Lincoln Open Data — legislative districts with voting districts](https://opendata.lincoln.ne.gov/documents/LincolnNE::legislative-districts-with-voting-districts/explore)
- [Nebraska Legislature](https://nebraskalegislature.gov/)
- [Nebraska Legislature — Fiscal Office](https://nebraskalegislature.gov/divisions/fiscal.php)
- [Nebraska Legislature — senator roster](https://nebraskalegislature.gov/pdf/senators/roster.pdf)
- [Unicameral Update](https://update.legislature.ne.gov/)
- [LegiScan API](https://legiscan.com/legiscan)
- [Nebraska Accountability and Disclosure Commission](https://nadc.nebraska.gov/)
- [NADC — public search](https://nadc-e.nebraska.gov/PublicSite/Search.aspx)
- [League of Women Voters Lincoln/Lancaster](https://lincolnleague.org/)
- [LWVLL — VOTE411 Lincoln city elections guide](https://lincolnleague.org/vote411-spring-2025/)
- [VOTE411](https://www.vote411.org/)
- [Flatwater Free Press — Nebraska Voter Guide](https://voterguide.flatwaterfreepress.org/)
- [Center for Civic Design — Plain language](https://civicdesign.org/topics/plain-language/)
- [Ballotpedia — Readability laws for ballot measure language](https://ballotpedia.org/Readability_laws_for_ballot_measure_language)
- [Ballotpedia — Ballot measure readability scores](https://ballotpedia.org/Ballot_measure_readability_scores,_2023)
