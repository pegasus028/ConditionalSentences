# Reviewer brief (independent adversarial review)

You did NOT write this content. Your job is to find and fix what the writer missed. Be strict: a wrong key or a
second defensible answer reaching a 13-year-old student is the failure we are preventing.

1. Read `/home/claude/cs/SPEC.md` fully, then the conditional-sentences skill files it lists (SKILL.md, decision-rules.md,
   thai-learners.md, exam-notes-and-item-writing.md, sensitivity.md; advanced-c1-c2.md for C1 content). The skill is the
   grammar authority. Where you doubt a rule, check it (you may use WebSearch for a reputable grammar source such as
   Cambridge Dictionary grammar, British Council LearnEnglish, Swan's Practical English Usage summaries) and say what you found.
2. Review the file named in your task, `/home/claude/cs/content/<file>.json`. Back it up first to your own scratch folder
   `/tmp/claude-0/-home-claude/8823f775-4aef-51cc-a833-8a13bb03986e/scratchpad/review-<file>/`. Make every fix with a script
   that loads the JSON, changes fields and writes it back (`json.dump(..., ensure_ascii=False, indent=1)`); never hand-edit.
   After fixing run `node /home/claude/cs/tools/validate.js <file>` until it prints `0 errors`.
3. For EVERY item (mcq, spot, type):
   - Put each option into the stem and read it with the context lines. Is exactly one defensible in standard British
     English and under the skill's rules? If a distractor is acceptable English in this context (even informally), fix the
     context or replace the distractor. Never leave a disputed pair keyed (was/were, may/might/could in a result, the
     American "in case" = "if", past simple vs "would" after wish for a habit, etc.).
   - Is `answer` the right index? Does each `fb` line match ITS option (same order as options) and is it literally true?
     Does the key's fb start with "Yes"? Is `why` literally true and under 35 words?
   - Does the `hint` point to the decision without giving or eliminating down to the answer?
   - Spot items: exactly one of the four segments is wrong, the others are definitely right, and no other fix elsewhere
     in the sentence would also repair it. `fix` is the corrected segment.
   - Typed items: does the frame force the answer? Add every acceptable variant to `accept` (contractions: would've /
     'd have; wouldn't / would not; were/was where both are fine; with or without "that"). Remove any wrong variant.
     The app lower-cases, strips commas and a final full stop before comparing.
   - Imagined items: is there a time or reality cue on screen, and is `truth` correct?
   - Natural British English a native teacher would sign; Thai-teen context; sensitivity rules (SPEC §3.2 rule 9); girls only as named students.
4. For every lesson, at EACH level (B1, B2, C1) separately: reading only that level's key, body and examples, could a
   student answer all 8 items of the lesson and that lesson's gate items and rule out every distractor? If a tested point
   is missing at a level, add a sentence in that level's register (keep paragraphs under ~85 words, B1 sentences under
   ~16 words, written for the ear: no "e.g.", arrows, "=", "+"). Remove giveaways: a lesson text must not copy or
   near-copy an item's sentence or list an item's exact wrong options. Check every grammar statement in the lesson text
   is true (no "50% possible"; "were" in writing, "was" fine in speech; third conditional is not only regret; etc.).
   Check each example's Truth note. Check `uses` are real uses with natural examples, and `formula` is right.
5. Do not change ids, the number or order of items, or the schema. Do not touch any other file or git.
6. Final report (short): how many items you changed and why (list ids with a few words each), any lesson-text facts you
   corrected, anything you were unable to resolve, and the validator result.
