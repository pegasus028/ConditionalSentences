/* What-If Worlds — data/worlds.js: the nine worlds (names, colours, order) and the Guidebook.
   Lesson text and questions live in data/content.js (built from content/*.json by tools/build.js). */
window.WORLDS = [
  { id: 'w1', n: 1, name: 'Fact Factory', nick: 'Zero conditional', short: 'Type 0', scene: 'factory', color: '#2fa36b', cefr: 'A2–B1', lessons: ['w1l1', 'w1l2', 'w1l3'],
    blurb: 'Things that are always true. If you press the button, the machine starts.', boss: 'The Conveyor' },
  { id: 'w2', n: 2, name: 'Promise Plaza', nick: 'First conditional', short: 'Type 1', scene: 'plaza', color: '#3f7cff', cefr: 'B1', lessons: ['w2l1', 'w2l2', 'w2l3'],
    blurb: 'A real, possible future. If you help me, I’ll give you a discount.', boss: 'The Deal Maker' },
  { id: 'w3', n: 3, name: 'Dream Tycoon', nick: 'Second conditional', short: 'Type 2', scene: 'tycoon', color: '#e8590c', cefr: 'B1–B2', lessons: ['w3l1', 'w3l2', 'w3l3'],
    blurb: 'Imagine now. If I had wings, I would fly to school.', boss: 'The Daydream' },
  { id: 'w4', n: 4, name: 'Rewind Tower', nick: 'Third conditional', short: 'Type 3', scene: 'tower', color: '#7b5cd6', cefr: 'B2', lessons: ['w4l1', 'w4l2', 'w4l3'],
    blurb: 'Imagine a different past. If I had left earlier, I would have caught the train.', boss: 'The Clock Keeper' },
  { id: 'w5', n: 5, name: 'Glitch Crossroads', nick: 'Mixed conditionals', short: 'Mixed 3/2 · 2/3', scene: 'crossroads', color: '#c2259e', cefr: 'B2–C1', lessons: ['w5l1', 'w5l2', 'w5l3'],
    blurb: 'Two times in one sentence. If I had slept, I wouldn’t be tired now.', boss: 'The Time Tangle' },
  { id: 'w6', n: 6, name: 'Connector Bridges', nick: 'Words other than if', short: 'unless · in case · as long as', scene: 'bridges', color: '#d9480f', cefr: 'B2', lessons: ['w6l1', 'w6l2', 'w6l3', 'w6l4', 'w6l5'],
    blurb: 'Unless, as long as, provided, in case, even if, suppose… each bridge has its own key.', boss: 'The Bridge Troll' },
  { id: 'w7', n: 7, name: 'Wish Island', nick: 'Wish and if only', short: 'wish · if only', scene: 'island', color: '#0c8599', cefr: 'B2–C1', lessons: ['w7l1', 'w7l2', 'w7l3', 'w7l4'],
    blurb: 'I wish I had more time. If only I hadn’t forgotten my umbrella.', boss: 'The Wishing Well' },
  { id: 'w8', n: 8, name: 'Formal Citadel', nick: 'Advanced forms (C1)', short: 'Had I known…', scene: 'citadel', color: '#5f6b7d', cefr: 'C1', lessons: ['w8l1', 'w8l2', 'w8l3'],
    blurb: 'Should you need help… Were I to try… Had I known… But for the rain…', boss: 'The Gate Guards' },
  { id: 'w9', n: 9, name: 'Final Arena', nick: 'Exam and writing power', short: 'All types', scene: 'arena', color: '#c92a2a', cefr: 'B2–C1', lessons: ['w9l1', 'w9l2', 'w9l3'],
    blurb: 'Everything together: rewriting, essays, and the last fight with the Glitch.', boss: 'The Glitch' }
];

/* ------------------------------------------------------------------ the Guidebook */
window.GUIDE = {
  title: 'The Guidebook',
  sub: 'Every conditional in simple words. Read it, listen to it, come back any time.',
  sections: [
    { id: 'dials', icon: '🎛️', title: 'The big idea: two questions',
      intro: [
        'A conditional sentence has two halves: the <b>if half</b> (the condition) and the <b>result half</b> (what happens). You can put them in either order. Use a comma only when the if half comes first.',
        'To choose the right verbs, ask two questions about each half. <b>When</b> is it: the past, now or always, or the future? And is it <b>real</b> (it can happen, or it does happen) or <b>imagined</b> (it is not true, or you are only dreaming)? This is about how the speaker sees it, not about a percentage.',
        'That is the whole system. The names you hear at school, zero, first, second, third and mixed, are just the most common answers to those two questions.'
      ] },
    { id: 'types', icon: '🧱', title: 'The six types',
      intro: ['Here are the six patterns your tests name. For each one: how to build it, what it means, and when people really use it.'],
      cards: [
        { tag: '0', name: 'Type 0 · Zero conditional', form: ['If + present', 'present'],
          meaning: 'Real and always true. Every time the first thing happens, the second thing happens. You can say <em>when</em> in place of <em>if</em>.',
          uses: [['Facts and science', 'If you heat ice, it melts.'], ['Habits and routines', 'If it rains, I take the MRT.'], ['Rules and instructions', 'If the alarm rings, leave the building.'], ['Advice that is always good', 'If you feel dizzy, you should sit down.']],
          truth: 'Nothing is imagined here, so there is no hidden truth.' },
        { tag: '1', name: 'Type 1 · First conditional', form: ['If + present', 'will + verb'],
          meaning: 'Real and possible, about one future time. The if half uses the present, even though it is about the future. Do not put <em>will</em> after <em>if</em> when you only mean the future.',
          uses: [['Plans and predictions', 'If it rains tomorrow, we will cancel the match.'], ['Promises', 'If you help me, I will buy you a bubble tea.'], ['Warnings', 'If you don’t hurry, you will miss the bus.'], ['Offers and deals', 'If you buy two, I can give you a discount.'], ['Maybe results', 'If I finish early, I might join you.']],
          truth: 'Nothing is imagined. It has not happened yet, and it really could.' },
        { tag: '2', name: 'Type 2 · Second conditional', form: ['If + past', 'would + verb'],
          meaning: 'Imagined, about now or the future. The past form does not mean past time. It means one step away from reality. Write <em>were</em> for every person: If I were, if she were.',
          uses: [['Dreams', 'If I had wings, I would fly to school.'], ['Advice', 'If I were you, I would tell the teacher.'], ['Things that are not true now', 'If we lived near the sea, we could swim every day.'], ['Futures you do not really expect', 'If I won the science prize, I would thank my team.'], ['Polite, careful requests', 'Would it be all right if I came a little later?']],
          truth: 'There is usually a hidden truth about now. If I had wings: the truth is, I do not have wings.' },
        { tag: '3', name: 'Type 3 · Third conditional', form: ['If + had + V3', 'would have + V3'],
          meaning: 'Imagined, about the past. It is finished and you cannot change it. You only imagine a different past. The result needs <em>have</em>: would have gone, could have won, might have seen.',
          uses: [['Regret', 'If I had left earlier, I would have caught the train.'], ['Relief', 'If you hadn’t reminded me, I would have forgotten my homework.'], ['Criticism', 'If you had listened, you wouldn’t have got lost.'], ['Thinking about what was possible', 'If we had practised more, we might have won.']],
          truth: 'There is a hidden truth about the past. If I had left earlier: the truth is, I did not leave early, and I missed the train.' },
        { tag: 'm32', name: 'Mixed 3/2 · past condition, present result', form: ['If + had + V3', 'would + verb (now)'],
          meaning: 'The if half is type 3, an imagined past. The result half is type 2, an imagined now. Something in the past changes how things are today. Look for <em>now</em>, <em>today</em> or <em>still</em>.',
          uses: [['A past action with a result you feel now', 'If I had slept well last night, I wouldn’t be tired now.'], ['Explaining today’s situation', 'If she had saved her pocket money, she would have enough for the ticket today.'], ['Big life turns', 'If we hadn’t moved to Bangkok, I would still live by the sea.']],
          truth: 'Two truths with two dates. I did not sleep well last night, and I am tired now.' },
        { tag: 'm23', name: 'Mixed 2/3 · present condition, past result', form: ['If + past', 'would have + V3'],
          meaning: 'The if half is type 2, something that is generally not true about you or the world. The result half is type 3, a past event that went differently because of it.',
          uses: [['Your character or abilities explaining a past event', 'If I weren’t afraid of heights, I would have gone up the tower yesterday.'], ['A general fact explaining a past event', 'If she spoke Japanese, she would have understood the film last night.'], ['Excuses and explanations', 'If I were better at reading maps, we wouldn’t have got lost on Saturday.']],
          truth: 'Two truths again. I am afraid of heights, that is always true, and I did not go up yesterday.' }
      ] },
    { id: 'stairs', icon: '🪜', title: 'The true meaning: one step back',
      intro: [
        'Why does <em>If I had wings</em> use a past form when it is about now? Because in English, a past form does two jobs. Job one is past time: I had a dog in 2020. Job two is <b>distance from reality</b>: If I had a dog, which means I do not have one.',
        'So to move from real to imagined, you take every verb <b>one step back</b>. Present becomes past. <em>Will</em> becomes <em>would</em>. <em>Can</em> becomes <em>could</em>. It is the same move you make in reported speech, but for a different reason: there you step back in time, here you step back from reality.',
        'If the imagined thing is in the past, you step back <b>twice</b>. Past becomes past perfect, had plus V3. <em>Would</em> becomes <em>would have</em>. That <em>have</em> is your past ticket. No ticket, no past.',
        'A quick check that nearly always works: write the truth. If you can write a truth that the sentence denies, it is imagined, so step back. If the truth is about now, step back once. If the truth is about the past, step back twice. If there is no hidden truth, the sentence is real, so do not step back at all.'
      ],
      stairs: [
        ['Real', 'One step back: imagined now', 'Two steps back: imagined past'],
        ['I am', 'I were', 'I had been'],
        ['I have', 'I had', 'I had had'],
        ['I go', 'I went', 'I had gone'],
        ['I can go', 'I could go', 'I could have gone'],
        ['I will go', 'I would go', 'I would have gone'],
        ['I may go', 'I might go', 'I might have gone']
      ],
      trio: [
        ['Real', 'If it rains, we will stay in.', 'It may rain. It is still possible.'],
        ['One step back', 'If it rained, we would stay in.', 'I am only imagining. I do not really expect rain.'],
        ['Two steps back', 'If it had rained, we would have stayed in.', 'It did not rain, and we went out.']
      ],
      family: 'The same step back works after <em>wish</em>, <em>if only</em>, <em>it’s time</em>, <em>would rather</em> and <em>as if</em>. I wish I had a cat: the truth is, I do not. I wish I had studied: the truth is, I did not. It’s time we left: we have not left yet.' },
    { id: 'conn', icon: '🌉', title: 'Words other than if',
      intro: ['<em>If</em> is not the only word that opens a condition. Each of these words has its own meaning, so each has its own test. After most of them, as after <em>if</em>, use the present for the future, not <em>will</em>.'],
      cards: [
        { name: 'unless', form: ['unless + present', 'result'], meaning: 'Means <em>except if</em>. Test: can you say "except if"? Never use <em>not</em> after it.', uses: [['', 'We will go for a picnic unless it rains.'], ['', 'You can’t come in unless you have a ticket.']] },
        { name: 'as long as · provided (that) · providing (that) · on condition that', form: ['as long as + present', 'result'], meaning: 'Means <em>only if</em>. It is a deal: you get the result, but there is one thing you must do.', uses: [['', 'You can borrow my bike as long as you bring it back by six.'], ['', 'Provided that you finish your homework, you can go out.']] },
        { name: 'in case', form: ['action now', 'in case + present'], meaning: 'Means <em>because maybe</em>. You do something first, to be ready. It is not the same as <em>if</em>. Test: do you act before the thing happens? Think of an umbrella.', uses: [['', 'Take an umbrella in case it rains.'], ['', 'I’ll write it down in case I forget.']] },
        { name: 'even if · even though', form: ['even if + present / past', 'result'], meaning: '<em>Even if</em>: maybe it happens, maybe not, and the result is the same. <em>Even though</em>: it is true, and the result still happens.', uses: [['', 'I’ll go to practice even if it rains.'], ['', 'I went to practice even though it was raining.']] },
        { name: 'when · as soon as · until', form: ['when + present', 'will + verb'], meaning: '<em>When</em> means you are sure it will happen. <em>If</em> means you are not sure. Both take the present for the future.', uses: [['', 'When I get home, I’ll call you.'], ['', 'If I get home early, I’ll call you.']] },
        { name: 'suppose · supposing · what if · imagine', form: ['Suppose + present / past', 'question or result'], meaning: 'These ask someone to picture a situation. Present for a real possibility, past for an imagined one, past perfect for an imagined past.', uses: [['', 'Suppose it rains tomorrow. What will we do?'], ['', 'What if you had missed the last train?']] },
        { name: 'otherwise · or (else)', form: ['instruction', 'otherwise + result'], meaning: 'Means <em>if not</em>. A conditional with no <em>if</em> at all.', uses: [['', 'Leave now. Otherwise you’ll miss the bus.'], ['', 'Hurry up, or we’ll be late.']] },
        { name: 'wish · if only', form: ['I wish + past', '(no result half)'], meaning: 'A sentence with only the imagined half. Past for a wish about now, past perfect for a regret, <em>would</em> for someone’s annoying habit. <em>If only</em> is stronger.', uses: [['', 'I wish I had more free time.'], ['', 'If only I hadn’t forgotten my umbrella.'], ['', 'I wish my brother wouldn’t take my charger.']] },
        { name: 'Should you… · Were I… · Had I… (formal, C1)', form: ['Had + subject + V3', 'result'], meaning: 'In formal writing you can drop <em>if</em> and start with <em>should</em>, <em>were</em> or <em>had</em>. The meaning stays the same.', uses: [['', 'Should you need any help, please ask.'], ['', 'Had I known about the test, I would have revised.']] },
        { name: 'but for · without', form: ['But for + noun', 'would (have) + verb'], meaning: 'Means <em>if it weren’t for</em> or <em>if it hadn’t been for</em>. A noun does the job of the whole if half.', uses: [['', 'But for the rain, we would have won.'], ['', 'Without your help, I would be lost.']] }
      ] },
    { id: 'glitch', icon: '⚠️', title: 'Five glitches to watch for',
      intro: ['Thai does not change the verb for imagined situations. English does. That is why these five mistakes are so common. Learn to hear them.'],
      list: [
        ['<s>If it will rain, we will stay at home.</s>', 'If it rains, we will stay at home.', 'No <em>will</em> after <em>if</em> for a plain future. The if half takes the photo, the result makes the promise.'],
        ['<s>If I am the teacher, I will give no homework.</s>', 'If I were the teacher, I would give no homework.', 'You are not the teacher, so it is imagined. Step back once.'],
        ['<s>If I knew, I would go.</s> (about yesterday)', 'If I had known, I would have gone.', 'It is about the past, so step back twice. Do not forget <em>have</em>.'],
        ['<s>If I would have known, I would have come.</s>', 'If I had known, I would have come.', '<em>Would</em> belongs in the result half, not in the if half.'],
        ['<s>In case it rains, I will stay at home.</s>', 'If it rains, I will stay at home.', '<em>In case</em> is for getting ready before. Take an umbrella in case it rains.']
      ] }
  ]
};
