import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'relative_subjunctive',
  title: 'Relative Clauses with the Subjunctive',
  summary:
    'Most relative clauses state a fact and use the indicative. With the subjunctive, a relative clause can express a purpose or describe the kind of person or thing meant. Learn the signals for each.',
  sections: [
    {
      heading: 'Fact or something more?',
      blocks: [
        {
          kind: 'p',
          text: 'An ordinary relative clause (quī, quae, quod) gives a **fact** about its antecedent, and its verb is **indicative**. When the verb of a relative clause is **subjunctive**, the clause is doing something more: it tells you **why** something was done (purpose) or **what sort** of person or thing is meant (characteristic).',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Mīles quī prope portam **stābat** nihil vīdit.',
              en: 'The soldier who was standing near the gate saw nothing.',
              note: 'Indicative: a plain fact about one soldier.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Relative subjunctives follow the sequence of tenses like other dependent clauses.',
        },
      ],
    },
    {
      heading: 'Relative Purpose',
      blocks: [
        {
          kind: 'p',
          text: 'In the M3 lesson you met the relative clause of purpose. When the main clause has a noun that the purpose clause can refer back to, Latin often uses a relative pronoun instead of ut: **quī = ut is** ("so that he"). The antecedent is usually the object of a verb of **sending, choosing or giving**. English normally translates with "to".',
        },
        {
          kind: 'p',
          text: 'Like any purpose clause, it looks forward from the main verb, so it uses only the **present** subjunctive (primary sequence) or the **imperfect** (secondary sequence).',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Rēx servum mīsit **quī** medicum **arcesseret**.',
              en: 'The king sent a slave to fetch the doctor.',
            },
            {
              la: 'Cōnsul virōs dēligit **quī** mūrōs **custōdiant**.',
              en: 'The consul is choosing men to guard the walls.',
            },
            {
              la: 'Librum tibi dabō **quem legās**.',
              en: 'I will give you a book to read.',
              note: 'The relative pronoun takes its own case: quem is the object of legās.',
            },
            {
              la: 'Locum quaerēbant **ubi** castra **pōnerent**.',
              en: 'They were looking for a place to pitch camp.',
              note: 'A relative adverb such as ubi can do the same job.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'With a **comparative** adjective or adverb, a purpose clause is introduced by **quō** ("so that by this much") instead of ut.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Mūrum altiōrem fēcērunt **quō** facilius urbem **dēfenderent**.',
              en: 'They made the wall higher so that they could defend the city more easily.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Relative Characteristic',
      blocks: [
        {
          kind: 'p',
          text: 'A relative clause of **characteristic** describes the **kind** of person or thing meant, not a particular one. The antecedent is usually general, indefinite or negative, and it comes in a few set patterns. English often translates with a plain verb; when the idea of "the sort who would" matters, bring it out.',
        },
        {
          kind: 'table',
          head: ['Signal', 'Meaning'],
          rows: [
            ['sunt quī, est quī', 'there are people who, there is someone who'],
            ['nēmō est quī, nihil est quod', 'there is no one who, there is nothing that'],
            ['quis est quī ...?', 'who is there who ...?'],
            ['sōlus est quī, ūnus est quī', 'he is the only one who'],
            ['nōn is sum quī', 'I am not the sort of man who'],
          ],
        },
        {
          kind: 'examples',
          items: [
            { la: '**Sunt quī** nihil **timeant**.', en: 'There are people who fear nothing.' },
            {
              la: '**Quis est quī** hunc virum nōn **laudet**?',
              en: 'Who is there who would not praise this man?',
            },
            {
              la: '**Nēmō** aderat **quī** Graecē **loquerētur**.',
              en: 'There was no one present who spoke Greek.',
            },
            {
              la: 'Tū **sōla es quae** mē adiuvāre **possīs**.',
              en: 'You are the only one who can help me.',
            },
            {
              la: '**Nōn is sum quī** perīcula **fugiam**.',
              en: 'I am not the sort of man who runs away from danger.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'A characteristic clause is not limited to the "same time" column. It can use the perfect or pluperfect for an action before the main verb.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Nūllus erat mīles **quī** Rōmam **vīdisset**.',
              en: 'There was not a single soldier who had seen Rome.',
              note: 'Secondary sequence, time before: pluperfect subjunctive.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Worthy and fit: dignus quī',
      blocks: [
        {
          kind: 'p',
          text: 'The adjectives **dignus** ("worthy"), **indignus** ("unworthy") and **idōneus** ("suitable, fit") are followed by **quī + subjunctive**. English uses an infinitive: "worthy **to** ...", "fit **to** ...".',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Hic liber **dignus est quī legātur**.',
              en: 'This book deserves to be read.',
            },
            {
              la: 'Puer **idōneus** nōn erat **quī** nāvem **regeret**.',
              en: 'The boy was not fit to steer the ship.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Telling them apart',
      blocks: [
        {
          kind: 'table',
          head: ['Clause', 'Antecedent or signal', 'Mood', 'English'],
          rows: [
            ['Simple relative', 'a particular person or thing', 'indicative', 'who, which (a fact)'],
            ['Relative purpose', 'object of sending, choosing, giving', 'present or imperfect subjunctive', 'to ..., so that he might ...'],
            ['Characteristic', 'sunt quī, nēmō est quī, sōlus est quī', 'subjunctive', 'who (the sort who would)'],
            ['dignus quī', 'dignus, indignus, idōneus', 'subjunctive', 'worthy to, fit to'],
          ],
        },
        {
          kind: 'tip',
          title: 'Check the mood first',
          text: 'A relative clause with an **indicative** verb is a plain fact: *Hic est mīles quī urbem servāvit*, "This is the soldier who saved the city." Only a **subjunctive** makes it purpose or characteristic. Then look at the main clause: a verb of sending or choosing points to **purpose**; an indefinite or negative antecedent (sunt quī, nēmō est quī) or sōlus points to **characteristic**.',
        },
      ],
    },
  ],
  check: ['m9-201', 'm9-202', 'm9-204', 'm9-304'],
};
