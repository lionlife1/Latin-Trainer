import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'conditionals',
  title: 'Conditionals',
  summary:
    'An "if" sentence is named by the mood and tense of its verbs. The simple and future more vivid types use the indicative; the future less vivid and the contrary-to-fact types use the subjunctive.',
  sections: [
    {
      heading: 'Protasis, apodosis and the types',
      blocks: [
        {
          kind: 'p',
          text: 'A conditional sentence has two halves. The **protasis** is the "if" clause, introduced by **sī** ("if") or **nisi** ("if not", "unless"). The **apodosis** is the main clause, the conclusion: "then...". To name the type, look at the mood and tense of the verb in each half.',
        },
        {
          kind: 'table',
          caption: 'Conditional types',
          head: ['Type', 'Protasis (sī...)', 'Apodosis', 'English'],
          rows: [
            ['Simple present', 'present indicative', 'present indicative', 'If he is..., he is...'],
            ['Simple past', 'past indicative', 'past indicative', 'If he was..., he was...'],
            ['Future more vivid', 'future or future perfect indicative', 'future indicative', 'If he does..., he will...'],
            ['Future less vivid', 'present subjunctive', 'present subjunctive', 'If he should..., he would...'],
            ['Present contrary to fact', 'imperfect subjunctive', 'imperfect subjunctive', 'If he were..., he would...'],
            ['Past contrary to fact', 'pluperfect subjunctive', 'pluperfect subjunctive', 'If he had..., he would have...'],
            ['Mixed contrary to fact', 'pluperfect subjunctive', 'imperfect subjunctive', 'If he had..., he would (now)...'],
          ],
        },
        {
          kind: 'p',
          text: 'The negative of sī is usually **nisi**: "if ... not" or "unless". The ordinary negative **nōn** can also stand inside a sī clause.',
        },
      ],
    },
    {
      heading: 'Simple and future more vivid: the indicative',
      blocks: [
        {
          kind: 'p',
          text: 'A **simple** condition makes no claim about whether the "if" is true; it just says that one thing goes with another. Both halves are indicative, present or past. A **future more vivid** condition talks about a future that is quite likely. Both halves look to the future, so Latin uses the **future indicative**, or the **future perfect** in the protasis when that action must be finished first.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Sī **pluit**, domī **manēmus**.', en: 'If it is raining, we stay at home.', note: 'Simple present.' },
            { la: 'Sī id **dīxit**, **errāvit**.', en: 'If he said that, he was wrong.', note: 'Simple past.' },
            { la: 'Sī mē **vocābis**, **veniam**.', en: 'If you call me, I will come.', note: 'Future more vivid.' },
            {
              la: 'Sī epistulam **scrīpseris**, eam **mittam**.',
              en: 'If you write the letter, I will send it.',
              note: 'Future perfect in the protasis: the writing comes first.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'English says "if you call" with a present tense, but Latin is exact: the calling is in the future, so it says vocābis, "you will call".',
        },
      ],
    },
    {
      heading: 'Future Less Vivid: "should... would"',
      blocks: [
        {
          kind: 'p',
          text: 'The **future less vivid** condition imagines a future that is possible but less likely. It uses the **present subjunctive in both halves**. Translate with "should" (or "were to") in the protasis and "would" in the apodosis.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Sī rēx **redeat**, cīvēs **gaudeant**.',
              en: 'If the king should return, the citizens would rejoice.',
            },
            {
              la: 'Sī hostēs **appropinquent**, portās **claudāmus**.',
              en: 'If the enemy should approach, we would close the gates.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Compare the future more vivid *Sī rēx redībit, cīvēs gaudēbunt*, "If the king returns, the citizens will rejoice." The meaning is close; the subjunctive simply makes the event sound less certain.',
        },
      ],
    },
    {
      heading: 'Present CTF: "were... would"',
      blocks: [
        {
          kind: 'p',
          text: 'A **present contrary-to-fact** (CTF) condition imagines something that is **not true now**. It uses the **imperfect subjunctive in both halves**. Translate "If ... were ..., ... would ...".',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Sī dīves **essem**, vīllam magnam **emerem**.',
              en: 'If I were rich, I would buy a large country house.',
              note: 'I am not rich.',
            },
            {
              la: 'Sī frāter meus **adesset**, nōs **adiuvāret**.',
              en: 'If my brother were here, he would be helping us.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Do not be misled by the name "imperfect". In this construction the imperfect subjunctive refers to the **present**.',
        },
      ],
    },
    {
      heading: 'Past CTF and mixed conditions',
      blocks: [
        {
          kind: 'p',
          text: 'A **past contrary-to-fact** condition imagines something that **did not happen** in the past. It uses the **pluperfect subjunctive in both halves**. Translate "If ... had ..., ... would have ...".',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Sī mātūrius **profectī essēmus**, ante noctem **pervēnissēmus**.',
              en: 'If we had set out earlier, we would have arrived before night.',
            },
            {
              la: 'Nisi mīlitēs fortiter **pugnāvissent**, urbs **capta esset**.',
              en: 'If the soldiers had not fought bravely, the city would have been captured.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'In a **mixed** contrary-to-fact condition, the two halves refer to different times. Most often a past condition (**pluperfect** subjunctive) has a present result (**imperfect** subjunctive). Words like nunc ("now"), hodiē ("today") and herī ("yesterday") help you see the change of time.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Sī mātūrius **profectī essēmus**, nunc domī **essēmus**.',
              en: 'If we had set out earlier, we would be at home now.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Naming a conditional',
      blocks: [
        {
          kind: 'p',
          text: 'Check the mood first. Indicative in both halves means a simple or future more vivid condition: look at the tense to choose. Subjunctive means one of the less vivid or contrary-to-fact types, and the tense tells you which: **present** = future less vivid, **imperfect** = present CTF, **pluperfect** = past CTF.',
        },
        {
          kind: 'tip',
          title: 'Name each half by its own tense',
          text: 'Do not assume both halves match. If the protasis is pluperfect subjunctive ("had...") and the apodosis is imperfect subjunctive ("would... now"), it is a **mixed** condition, not a past CTF. And do not mix up present subjunctive with imperfect: *sī veniat* is "if he should come" (future less vivid), but *sī venīret* is "if he were coming" (present CTF).',
        },
        {
          kind: 'tip',
          title: 'Future more vivid uses the future',
          text: 'In a future more vivid condition both halves are **future indicative** (or future perfect in the protasis), even though English puts the "if" clause in the present.',
        },
      ],
    },
  ],
  check: ['m7-102', 'm7-201', 'm7-302', 'm7-501', 'm7-505'],
};
