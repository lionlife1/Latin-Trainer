import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'sequence_of_tenses',
  title: 'Sequence of Tenses',
  summary:
    'The tense of a subjunctive in a dependent clause is not a free choice. It depends on two things: the tense of the main verb, and whether the subjunctive action happens at the same time as the main verb or before it.',
  sections: [
    {
      heading: 'The big idea',
      blocks: [
        {
          kind: 'p',
          text: 'Most subjunctives sit in a dependent clause attached to a main verb. To pick (or identify) the right subjunctive tense, ask two questions in order:',
        },
        {
          kind: 'p',
          text: '**1. What tense is the main verb?** This puts the sentence in **primary** or **secondary** sequence. **2. When does the subjunctive action happen compared with the main verb?** At the **same time**, or **before** it? This is called **relative time**.',
        },
        {
          kind: 'p',
          text: 'Two answers to the first question and two to the second give four boxes, and each box has exactly one subjunctive tense in it.',
        },
      ],
    },
    {
      heading: 'Primary Sequence',
      blocks: [
        {
          kind: 'p',
          text: 'A main verb in the **present, future or future perfect** tense (or a command) looks at the present or the future. That puts the sentence in **primary sequence**, which uses the **present** and **perfect** subjunctive.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Quaerō cūr puer **lacrimet**.',
              en: 'I ask why the boy is crying.',
              note: 'Present main verb, same time: present subjunctive.',
            },
            {
              la: 'Quaerō cūr puer **lacrimāverit**.',
              en: 'I ask why the boy cried.',
              note: 'Present main verb, time before: perfect subjunctive.',
            },
            {
              la: 'Mox intellegēs quid **agāmus**.',
              en: 'Soon you will understand what we are doing.',
              note: 'Future main verb, so this is primary too.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Secondary Sequence',
      blocks: [
        {
          kind: 'p',
          text: 'A main verb in the **imperfect, perfect or pluperfect** tense looks at the past. That puts the sentence in **secondary sequence** (also called historical sequence), which uses the **imperfect** and **pluperfect** subjunctive.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Quaerēbam cūr puer **lacrimāret**.',
              en: 'I was asking why the boy was crying.',
              note: 'Imperfect main verb, same time: imperfect subjunctive.',
            },
            {
              la: 'Quaesīvī cūr puer **lacrimāvisset**.',
              en: 'I asked why the boy had cried.',
              note: 'Perfect main verb, time before: pluperfect subjunctive.',
            },
            {
              la: 'Cognōverant quis portam **aperuisset**.',
              en: 'They had found out who had opened the gate.',
              note: 'Pluperfect main verb, so this is secondary too.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Relative Time: same time or time before',
      blocks: [
        {
          kind: 'p',
          text: 'Relative time means time compared with the main verb, not compared with today. "Same time" means the subjunctive action is going on while the main action happens. "Time before" means it was already finished by then.',
        },
        {
          kind: 'table',
          caption: 'The sequence of tenses',
          head: ['Main verb', 'Sequence', 'Same time', 'Time before'],
          rows: [
            ['present, future, future perfect, command', 'Primary', 'present subjunctive', 'perfect subjunctive'],
            ['imperfect, perfect, pluperfect', 'Secondary', 'imperfect subjunctive', 'pluperfect subjunctive'],
          ],
        },
        {
          kind: 'table',
          caption: 'The same four boxes with real forms (amō, 3rd sg.)',
          head: ['Sequence', 'Same time', 'Time before'],
          rows: [
            ['Primary', 'amet / amētur', 'amāverit / amātus sit'],
            ['Secondary', 'amāret / amārētur', 'amāvisset / amātus esset'],
          ],
        },
        {
          kind: 'p',
          text: 'In English, same time comes out as "is doing" (primary) or "was doing" (secondary). Time before comes out as "did" or "has done" (primary) or "had done" (secondary).',
        },
        {
          kind: 'p',
          text: 'Deponent verbs follow the same table with their passive-looking forms: loquātur, locūtus sit (primary); loquerētur, locūtus esset (secondary).',
        },
      ],
    },
    {
      heading: 'Putting it to work',
      blocks: [
        {
          kind: 'p',
          text: 'Purpose clauses and indirect commands always point forward from the main verb, so they only ever use the **same time** column: present subjunctive in primary sequence, imperfect in secondary.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Clāmāmus ut nōs **audiant**.',
              en: 'We are shouting so that they may hear us.',
              note: 'Present main verb: present subjunctive.',
            },
            {
              la: 'Clāmāvimus ut nōs **audīrent**.',
              en: 'We shouted so that they might hear us.',
              note: 'Perfect main verb: imperfect subjunctive.',
            },
          ],
        },
        {
          kind: 'tip',
          title: 'Read a two-word passive as one verb',
          text: 'A participle plus a form of esse is a single verb, and the esse form tells you its tense. **missus sit** is perfect subjunctive (primary, time before). **missus esset** is pluperfect subjunctive (secondary, time before). Do not see esset and answer "imperfect, same time".',
        },
        {
          kind: 'tip',
          title: 'The historical present',
          text: 'Writers often tell a past story in the present tense to make it vivid. A historical present can take either sequence. **Secondary** sequence is very common, because the events are really past, but primary sequence also appears. To see which one the writer chose, look at the tense of the subjunctive.',
        },
      ],
    },
  ],
  check: ['m1-303', 'm1-402', 'm1-602', 'm1-603', 'm1-605'],
};
