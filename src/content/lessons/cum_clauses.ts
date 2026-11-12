import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'cum_clauses',
  title: 'Cum Clauses',
  summary:
    'With a subjunctive, cum means "when", "since" or "although". Learn to tell the preposition from the conjunction, and the three subjunctive uses from one another and from the indicative temporal cum.',
  sections: [
    {
      heading: 'Preposition or conjunction?',
      blocks: [
        {
          kind: 'p',
          text: 'The word cum does two different jobs. As a **preposition** it takes the **ablative** and means "with". As a **conjunction** it introduces a whole clause with its own verb, and then it means "when", "since" or "although".',
        },
        {
          kind: 'p',
          text: 'So before you translate cum, look at what follows it. If an ablative noun or pronoun comes straight after it and there is no verb in the phrase, cum means "with". If cum starts a clause with a verb, it is a conjunction, and the verb is usually **subjunctive**.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: '**Cum sorōre** in hortō sedēbam.',
              en: 'I was sitting in the garden with my sister.',
              note: 'sorōre is ablative and there is no verb with cum: preposition.',
            },
            {
              la: '**Cum** nāvis portuī **appropinquāret**, nautae gaudēbant.',
              en: 'When the ship was approaching the harbour, the sailors were rejoicing.',
              note: 'appropinquāret is a subjunctive verb: conjunction.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'A cum clause with the subjunctive follows the **sequence of tenses**. After a past main verb, the imperfect subjunctive shows the **same time** and the pluperfect shows **time before**. After a present or future main verb, the present and perfect do the same jobs.',
        },
      ],
    },
    {
      heading: 'Circumstantial Cum: "when"',
      blocks: [
        {
          kind: 'p',
          text: 'A **circumstantial** cum clause describes the situation in which a past event happened. It uses the **imperfect** subjunctive for background that was going on at the time ("when / while ... was ...ing") and the **pluperfect** subjunctive for something already finished ("when / after ... had ..."). Translate cum as "when".',
        },
        {
          kind: 'examples',
          items: [
            {
              la: '**Cum** per silvam **errārent**, lupum vīdērunt.',
              en: 'When they were wandering through the forest, they saw a wolf.',
              note: 'Imperfect: the wandering was going on when they saw the wolf.',
            },
            {
              la: '**Cum** Hannibal Alpēs **trānsiisset**, in Italiam dēscendit.',
              en: 'When Hannibal had crossed the Alps, he came down into Italy.',
              note: 'Pluperfect: the crossing was over first.',
            },
            {
              la: '**Cum** epistula **lēcta esset**, omnēs tacuērunt.',
              en: 'When the letter had been read, everyone fell silent.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'English usually says "when he heard" where Latin says cum audīvisset, "when he had heard". Both are fine translations; the Latin pluperfect simply makes clear that the hearing came first.',
        },
      ],
    },
    {
      heading: 'Causal Cum: "since"',
      blocks: [
        {
          kind: 'p',
          text: 'A **causal** cum clause gives the **reason** for the main action. Translate cum as "since" or "because". Unlike the circumstantial use, it is not limited to the past: it can stand in either sequence and use any of the four subjunctive tenses.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: '**Cum** via longa **sit**, hodiē nōn proficīscēmur.',
              en: 'Since the road is long, we will not set out today.',
              note: 'Future main verb: primary sequence, present subjunctive.',
            },
            {
              la: '**Cum** pater **discesserit**, nōs domum cūrāmus.',
              en: 'Since Father has left, we are looking after the house.',
              note: 'Primary sequence, time before: perfect subjunctive.',
            },
            {
              la: '**Cum** frūmentum nōn **habērent**, oppidum relīquērunt.',
              en: 'Since they had no grain, they left the town.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Sometimes a past cum clause makes sense both as a background ("when") and as a reason ("since"). Then either translation is reasonable. Let the meaning of the two clauses guide you.',
        },
      ],
    },
    {
      heading: 'Concessive Cum: "although"',
      blocks: [
        {
          kind: 'p',
          text: 'A **concessive** cum clause states a fact that you would expect to stop the main action, but it does not. Translate cum as "although". The main clause very often contains **tamen** ("nevertheless"), and when it does, the cum clause is almost certainly concessive.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: '**Cum** mīlitēs fessī **essent**, **tamen** iter fēcērunt.',
              en: 'Although the soldiers were tired, they nevertheless kept marching.',
            },
            {
              la: '**Cum** tē **amem**, hoc tibi dare nōn possum.',
              en: 'Although I love you, I cannot give you this.',
              note: 'No tamen here: the clash between the two clauses shows it is concessive.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Temporal Cum with the indicative',
      blocks: [
        {
          kind: 'p',
          text: 'Not every cum clause is subjunctive. When cum refers to **present or future time** and simply says "when", it takes the **indicative**. Notice that Latin uses a future where English uses a present.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: '**Cum** Rōmam **veniēs**, mē vidēbis.',
              en: 'When you come to Rome, you will see me.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'In the past, cum takes the indicative when it only dates an event ("at the time when"), and in **cum inversum**. In cum inversum the order of ideas is turned around: the first clause sets a scene in the imperfect or pluperfect, often with iam or vix, and the cum clause reports the main, sudden event in the indicative, often with subitō.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Iam nox erat, **cum** nūntius subitō **advēnit**.',
              en: 'It was already night when suddenly a messenger arrived.',
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
          head: ['Use', 'Mood', 'English', 'Clue'],
          rows: [
            ['cum + ablative', 'no verb', 'with', 'an ablative noun right after cum'],
            ['Circumstantial', 'imperfect or pluperfect subjunctive', 'when', 'background to a past event'],
            ['Causal', 'subjunctive, any tense', 'since', 'the clause gives a reason'],
            ['Concessive', 'subjunctive, any tense', 'although', 'tamen, or a clash with the main clause'],
            ['Temporal', 'indicative', 'when', 'present or future time; cum inversum'],
          ],
        },
        {
          kind: 'tip',
          title: 'Check for a verb before you translate cum',
          text: 'The commonest slip is translating every cum as "when". First ask: is there a verb in the cum phrase? If not, it is the preposition "with": *cum amīcō*, "with a friend". If there is, check its mood. An indicative means plain temporal "when" (*cum veniēs*). A subjunctive means circumstantial, causal or concessive, and the main clause tells you which.',
        },
        {
          kind: 'tip',
          title: 'Imperfect for background',
          text: 'In a circumstantial clause, the **imperfect** subjunctive shows something going on at the same time as the past main verb. The **pluperfect** shows something already finished. Do not read the imperfect as "had".',
        },
      ],
    },
  ],
  check: ['m4-103', 'm4-202', 'm4-203', 'm4-409', 'm4-504'],
};
