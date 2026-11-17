# What-If Worlds

A gamified self-study app for English **conditional sentences**, from the zero conditional to C1, for T.Chris's
students (Thai girls aged 13–17; first of all Mikii, 13, B2, *Gateway to the World B2* Unit 6, IELTS later).
The game is an original blocky-world adventure: a blocky avatar, obby (obstacle course) runs, Bits to spend,
pets that hatch, a story that links the worlds, and a 3D plaza with portals to the other apps.

- App: `https://pegasus028.github.io/ConditionalSentences/`
- The Plaza (hub for all apps): `https://pegasus028.github.io/ConditionalSentences/hub/`
- Content contract: `SPEC.md`

It is not a Roblox game and uses none of Roblox's names, logo or characters; only the general style of
blocky world games.

## What is in it

| Part | What it does |
|---|---|
| **Worlds** (home) | Nine worlds, opened in order by clearing each world's boss gate (or by the placement run). One "next step" button always says what to do next. |
| **Lessons** (30) | Each lesson has the pattern as two blocks, an explanation at **B1 (simple), B2 (standard) or C1 (full)**, examples with a **Truth** line for every imagined sentence, "When do people say this?" use cases, and a **Listen** button (recorded Sonia voice, pause, slower). |
| **Obby runs** | 8 questions per lesson: 3 on meaning, then 5 on form. Multiple choice, find-the-mistake and typed answers. A wrong first answer gets a hint and a second try for half marks; every option has its own feedback. Stars, Bits, XP, combos. |
| **Boss gates** | 8 questions, one try each, no hints. 6 out of 8 clears the world, opens the next one, hatches a pet and opens a new arcade game. |
| **Story** | *What-If Worlds: Pim and the Glitch* — a prologue and one chapter per world (21 pages). The glowing sentences are tappable and name their type. Listen, and "Turn the pages for me". |
| **Guidebook** | The whole topic in simple words: the two questions (When? Real or imagined?), the six types (0, 1, 2, 3, mixed 3/2, mixed 2/3) with use cases, the true meaning (one step back), words other than *if*, and five common mistakes. |
| **Arcade** | Five 60-second sorting games (Always or This Time?, Real or Imagined?, Glitch Hunt, Type Sorter, Connector Clash) and the What-If Machine (one event told in six ways). |
| **Tests** | Placement run (18), Unit 6 grammar check (20, typed, same shape as the book's own test), Final check B2 (20), Final check C1 (20). No hints; answers at the end; "study these next" links. |
| **Respawn Room** | Every missed question comes back for a second chance until it is answered right first time. |
| **Wardrobe / Me** | Avatar (skin, hair, clothes), accessories bought with Bits, pets; two scores (**Meaning** and **Form**), accuracy by type, surprise badges, **Copy my report** for LINE, settings (level, day/night, sound, "open every world" for teachers, reset). |
| **The Plaza** (`hub/`) | A 3D blocky plaza: walk the same avatar to a portal to open another app. Eight coins a day add to the Bits. Portals are listed in `hub/portals.js`. |

### The worlds

| # | World | Grammar | Lessons |
|---|---|---|---|
| 1 | Fact Factory | Zero conditional (type 0) | 3 |
| 2 | Promise Plaza | First conditional (type 1), time clauses | 3 |
| 3 | Dream Tycoon | Second conditional (type 2), the true meaning | 3 |
| 4 | Rewind Tower | Third conditional (type 3) | 3 |
| 5 | Glitch Crossroads | Mixed 3/2 and 2/3, naming all six types | 3 |
| 6 | Connector Bridges | unless · as long as / provided · in case · even if / otherwise · suppose / what if | 5 |
| 7 | Wish Island | wish / if only (+ past, + past perfect, + would), it's time, would rather, as if | 4 |
| 8 | Formal Citadel | Inversion, were to, but for, when the rules bend (C1) | 3 |
| 9 | Final Arena | Rewriting with a key word, conditionals in essays (IELTS), mixed mastery | 3 |

Lessons that match *Gateway B2* Unit 6 carry a "Coursebook p.72 / pp.72–73 / p.76 / p.77" label (worlds 1–4,
the first three Connector Bridges lessons and the first three Wish Island lessons).

## Files

```
index.html      shell (header, navigation, <main>)
app.css         styles, light and dark
app.js          state, lobby, worlds, lessons            play.js   obby runner, gates, Respawn Room, tests
more.js         story, Guidebook, arcade, wardrobe, profile       art.js    avatar, pets and scenes drawn in code (SVG)
reader.js       the read-aloud player (shared <audio>, pause/resume, bar)     tts-clean.js  on-screen text → spoken text
parts.js        exactly which pieces a Listen button reads (shared by the app and the recorder)
data/worlds.js  world names and colours + the Guidebook text   ← edit by hand
content/*.json  ALL lessons, questions, tests, story and game decks   ← edit these, then run tools/build.js
data/content.js generated from content/*.json (do not edit)    data/tts.js   generated list of recorded clips
audio/tts/      one Sonia MP3 per spoken part
hub/            The Plaza: index.html, hub.js, portals.js (← edit to add or remove portals), vendor/three.min.js
tools/          validate.js, build.js, tts-list.js, make-audio.py, smoke.js, flow.js
docs/           the writer and reviewer briefs, the research report the grammar skill was built from
.github/workflows/record-audio.yml   re-records changed read-aloud text on every push
```

## Editing content

1. Edit a file in `content/` (`w1.json` … `w9.json`, `tests.json`, `story.json`, `games.json`). Shapes and rules are in `SPEC.md`.
2. `node tools/validate.js` must print `0 errors`.
3. `node tools/build.js` writes `data/content.js`.
4. Raise the `?v=` on the script tags in `index.html`, commit and push. The GitHub workflow records any changed
   read-aloud text and commits the clips by itself.

To add an app to The Plaza, add one line to `hub/portals.js`.

## Read-aloud recordings

Listen buttons play recordings in Microsoft **Sonia** (en-GB-SoniaNeural, 90% speed): every lesson at B1, B2 and C1
(name and key sentence, each paragraph, each example), every story page, every Guidebook section. One clip per part,
named by a hash of the spoken text, so an edited part simply has no clip (the browser's own British voice reads it)
until it is re-recorded. Questions are never read aloud.

Re-recording is automatic on push. By hand: `pip install edge-tts`, then `python tools/make-audio.py --prune`, and commit
`audio/tts/` and `data/tts.js`.

## Tests (for whoever edits the code)

```
node tools/validate.js                      # content rules
for f in *.js data/*.js tools/*.js hub/*.js; do node --check "$f"; done
python3 -m http.server 8765 &               # then:
NODE_PATH=$(npm root -g) node tools/smoke.js   # screenshots of every screen, phone and desktop
NODE_PATH=$(npm root -g) node tools/flow.js    # answers every question with its key in a real browser, plays wrong answers,
                                               # second tries, gates, story, Guidebook, arcade, all four tests, wardrobe
```

## Progress and privacy

Everything is saved in the browser under the key `whatif.v1` (no account, no server). "Start again from zero" clears only
that key. The Plaza reads the same key for the avatar and Bits, and only checks whether other apps' keys exist.

## To check

- The Thai lines on some lessons are drafts built from a short list of bridges and have not been read by a Thai speaker.
- Typed answers accept the listed variants only; if a good answer is marked wrong, add it to that item's `accept` list.
- Mock tests are practice in exam style; the format is unofficial.

## Build facts

Built 17 Nov 2026. 30 lessons × 3 levels, 240 lesson questions, 72 boss-gate questions, 78 test questions,
5 arcade decks (168 sentences), 12 What-If Machine events, a 21-page story. Grammar authority: T.Chris's
`conditional-sentences` skill (built from the research report in `docs/`). Every question was written by one model
instance, reviewed by another, answered with its key in a real browser, and blind-tested against each level's lesson text.
