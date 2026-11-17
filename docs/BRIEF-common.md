# Writer brief (common part)

You are one of several writers building content for "What-If Worlds", a gamified self-study app on English
conditional sentences for Thai teenage girls (A2 to C1). Work only on the file named in your task.

1. Read `/home/claude/cs/SPEC.md` completely. It is the contract: schemas, fixed ids, the question standard,
   the levelled-lesson rules, sensitivity rules.
2. Read the subject skill files SPEC.md section 0 lists (they are the authority on grammar and keys).
3. Draft the content, build the JSON with a script kept in your own scratch folder
   (`/tmp/claude-0/-home-claude/8823f775-4aef-51cc-a833-8a13bb03986e/scratchpad/work-<file>/`), write it to
   `/home/claude/cs/content/<file>.json`, and run `node /home/claude/cs/tools/validate.js <file>` until it prints `0 errors`
   (fix warnings where they are real).
4. Then re-read every item as a strict examiner: put every option into the stem; is exactly one defensible?
   Does the context on screen force the key? Is the hint safe? Is `why` literally true? Does each level's
   lesson text teach everything the 8 items and the gate need, without copying an item's sentence?
   Fix what you find and re-validate.
5. Do not edit any other file. Do not write JS. Do not touch git.
6. Finish with a short report: counts, validator result, and anything you were unsure about.

Quality bar: natural British English a native teacher would sign; lively Thai-teen contexts; variety (do not
start every stem with "If I"); results with might / could / can / imperative as well as will / would.
