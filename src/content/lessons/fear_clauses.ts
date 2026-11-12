import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'fear_clauses',
  title: 'Fear Clauses',
  summary:
    'After a verb of fearing, nē means "that" and ut means "that ... not". Learn the verbs that set up a fear clause, the reversal of the two conjunctions, and how tense works.',
  sections: [
    {
      heading: 'Verbs of fearing',
      blocks: [
        {
          kind: 'p',
          text: 'A fear clause says what someone is afraid **might happen** (or might have happened). It depends on a verb or expression of fearing, and its verb is **subjunctive**.',
        },
        {
          kind: 'table',
          head: ['Latin', 'Meaning'],
          rows: [
            ['timeō, timēre', 'fear, be afraid'],
            ['metuō, metuere', 'fear, be afraid'],
            ['vereor, verērī (deponent)', 'fear, be afraid'],
            ['timor est, metus est', 'there is fear'],
            ['perīculum est', 'there is a danger'],
          ],
        },
        {
          kind: 'p',
          text: 'Do not confuse these with lookalike verbs that have nothing to do with fear: **vetō** ("forbid"), **volō** ("want") and **vertō** ("turn").',
        },
      ],
    },
    {
      heading: 'Positive Fear: nē = "that"',
      blocks: [
        {
          kind: 'p',
          text: 'When you fear that something **will** happen, Latin uses **nē**. Translate it as **"that"** (older English uses "lest"). This feels backwards, because elsewhere nē is negative. It makes sense if you think of the fear clause as a wish: "I am afraid: may he not come!" means "I am afraid **that** he will come."',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Timeō **nē** frāter meus **aegrōtet**.',
              en: 'I am afraid that my brother is ill.',
            },
            {
              la: 'Nautae metuēbant **nē** tempestās nāvem **dēlēret**.',
              en: 'The sailors were afraid that the storm would destroy the ship.',
            },
            {
              la: 'Vereor **nē** hoc frūstrā **fēcerīmus**.',
              en: 'I am afraid that we have done this for nothing.',
            },
            {
              la: 'Perīculum erat **nē** hostēs oppidum **caperent**.',
              en: 'There was a danger that the enemy would capture the town.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Negative Fear: ut or nē nōn = "that ... not"',
      blocks: [
        {
          kind: 'p',
          text: 'When you fear that something will **not** happen, Latin uses **ut** or **nē nōn**. Both mean **"that ... not"**. The verb itself is an ordinary subjunctive; the "not" comes from the conjunction.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Timeō **ut** epistula ad tē **perveniat**.',
              en: 'I am afraid that the letter will not reach you.',
            },
            {
              la: 'Verēbāmur **nē** frūmentum **nōn sufficeret**.',
              en: 'We were afraid that the grain would not be enough.',
            },
          ],
        },
        {
          kind: 'tip',
          title: 'The reversal',
          text: 'In a fear clause the conjunctions swap their usual meanings. **nē** means **"that"**: *Timeō nē nāvis mergātur*, "I am afraid that the ship will sink." **ut** (or **nē nōn**) means **"that ... not"**: *Timeō ut nāvis redeat*, "I am afraid that the ship will not come back." Never translate ut here as "so that" or "in order to", and never add a "not" for nē.',
        },
      ],
    },
    {
      heading: 'Tense in a fear clause',
      blocks: [
        {
          kind: 'p',
          text: 'Fear clauses follow the sequence of tenses. Because fears usually look **ahead**, the present subjunctive (primary) and the imperfect subjunctive (secondary) cover both what is happening now and what may happen **later**. English often needs "will" or "would" for them. The perfect and pluperfect show a fear about something that may **already** have happened.',
        },
        {
          kind: 'table',
          caption: 'vincō in a fear clause: "that the enemy ..."',
          head: ['Main verb', 'Same time or later', 'Time before'],
          rows: [
            ['Primary: Timeō nē hostēs ...', 'vincant: "will win, are winning"', 'vīcerint: "have won"'],
            ['Secondary: Timēbam nē hostēs ...', 'vincerent: "would win, were winning"', 'vīcissent: "had won"'],
          ],
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Metuimus **nē** pōns **frangātur**.',
              en: 'We are afraid that the bridge will be broken.',
              note: 'Primary, looking ahead: present subjunctive.',
            },
            {
              la: 'Verita est **nē** fīlius **āmissus esset**.',
              en: 'She was afraid that her son had been lost.',
              note: 'Secondary, time before: pluperfect subjunctive.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Fear clause or something else?',
      blocks: [
        {
          kind: 'p',
          text: 'The same conjunctions appear in purpose clauses, where nē means "so that ... not". Look at the main verb. If it is a verb of fearing, nē means "that". If the clause gives the aim of an action, nē means "so that ... not".',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Portam claudimus **nē** lupī **intrent**.',
              en: 'We are shutting the gate so that the wolves may not come in.',
              note: 'Purpose clause.',
            },
            {
              la: 'Timēmus **nē** lupī **intrent**.',
              en: 'We are afraid that the wolves will come in.',
              note: 'Fear clause.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'A verb of fearing can also take a plain **infinitive**, meaning "be afraid **to** do something". Then there is no conjunction and no subjunctive.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Puer **timet** in aquam **dēsilīre**.', en: 'The boy is afraid to jump into the water.' },
          ],
        },
        {
          kind: 'table',
          head: ['Meaning', 'Latin', 'English'],
          rows: [
            ['fear that something will happen', 'nē + subjunctive', 'that ...'],
            ['fear that something will not happen', 'ut or nē nōn + subjunctive', 'that ... not'],
            ['be afraid to do something yourself', 'infinitive', 'to ...'],
          ],
        },
      ],
    },
  ],
  check: ['m6-102', 'm6-201', 'm6-204', 'm6-302', 'm6-607'],
};
