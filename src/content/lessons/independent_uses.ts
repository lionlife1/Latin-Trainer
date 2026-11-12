import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'independent_uses',
  title: 'Independent Subjunctives',
  summary:
    'Four uses of the subjunctive stand alone as the main verb of a sentence: hortatory, jussive, optative and deliberative. Learn what each one says, how to translate it, and which negative it takes.',
  sections: [
    {
      heading: 'A subjunctive on its own',
      blocks: [
        {
          kind: 'p',
          text: 'In most sentences the subjunctive sits in a dependent clause. In these four uses it is the **main verb**. There is no ut and no main verb to follow, so you identify the use from three clues: the **person** of the verb, its **tense**, and whether the sentence is a **question** or contains **utinam**.',
        },
        {
          kind: 'p',
          text: 'The negative is part of the pattern too. Hortatory, jussive and optative subjunctives use **nē**. Only the deliberative uses **nōn**.',
        },
      ],
    },
    {
      heading: 'Hortatory: "Let us..."',
      blocks: [
        {
          kind: 'p',
          text: 'The hortatory subjunctive urges a group that includes the speaker to act. It is a **1st person** (almost always plural) **present subjunctive**, translated "Let us...". The negative is **nē**: "Let us not...".',
        },
        {
          kind: 'examples',
          items: [
            { la: '**Cantēmus** et **rīdeāmus**!', en: 'Let us sing and laugh!' },
            { la: '**Scrībāmus** epistulam.', en: 'Let us write a letter.' },
            { la: '**Nē timeāmus** hostēs.', en: 'Let us not fear the enemy.' },
          ],
        },
      ],
    },
    {
      heading: 'Jussive: "Let him...", "Let them..."',
      blocks: [
        {
          kind: 'p',
          text: 'The jussive subjunctive gives an order to someone who is not being spoken to directly. It is a **3rd person present subjunctive**, translated "Let him / her / it / them..." or "He / They should...". It can be passive. The negative is **nē**.',
        },
        {
          kind: 'examples',
          items: [
            { la: '**Taceat** puer!', en: 'Let the boy be quiet!' },
            { la: 'Servī **labōrent**.', en: 'Let the slaves work.' },
            { la: 'Porta **claudātur**.', en: 'Let the gate be shut.' },
            { la: '**Nē** mīlitēs **dormiant**.', en: 'Let the soldiers not sleep.' },
          ],
        },
        {
          kind: 'p',
          text: 'To forbid the person you are talking to (2nd person), Latin uses **nē + perfect subjunctive**. This is called the **prohibitive** subjunctive. Another common way is **nōlī** (to one person) or **nōlīte** (to several) + infinitive.',
        },
        {
          kind: 'examples',
          items: [
            { la: '**Nē** hoc **dīxerīs**!', en: 'Do not say this!' },
            { la: '**Nē** mē **relīquerītis**!', en: 'Do not leave me!' },
            { la: '**Nōlīte currere**!', en: 'Do not run!' },
          ],
        },
        {
          kind: 'tip',
          title: 'A perfect that is not past',
          text: 'In a prohibition, the perfect subjunctive has no past meaning at all. **Nē hoc dīxerīs** means "Do not say this!", not "You did not say this" or "May you not have said this".',
        },
      ],
    },
    {
      heading: 'Optative: wishes',
      blocks: [
        {
          kind: 'p',
          text: 'The optative subjunctive expresses a wish. It is often introduced by **utinam** ("if only", "would that"), and its negative is **nē** (utinam nē). The tense tells you what kind of wish it is.',
        },
        {
          kind: 'table',
          head: ['Tense', 'Kind of wish', 'Example', 'English'],
          rows: [
            ['present', 'possible, for the future', 'Utinam fīlius meus salvus **redeat**!', 'May my son come home safe!'],
            ['imperfect', 'impossible now (unfulfilled present)', 'Utinam pater nōs **spectāret**!', 'If only Father were watching us!'],
            ['pluperfect', 'impossible in the past (unfulfilled past)', 'Utinam domī **mānsissēs**!', 'If only you had stayed at home!'],
          ],
        },
        {
          kind: 'p',
          text: 'The imperfect and pluperfect here match the tenses of contrary-to-fact conditions: imperfect for something untrue now, pluperfect for something that did not happen in the past. A present wish can also stand without utinam.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Utinam **nē** illud **dīxissem**!', en: 'If only I had not said that!' },
            { la: '**Valeās**!', en: 'May you be well! (Farewell!)' },
          ],
        },
      ],
    },
    {
      heading: 'Deliberative: "What am I to do?"',
      blocks: [
        {
          kind: 'p',
          text: 'The deliberative subjunctive is a **question** in which the speaker wonders what to do. Often it is not a real request for information but a way of thinking aloud. Use the **present subjunctive** for doubt now ("What am I to...?", "What should I...?") and the **imperfect subjunctive** for doubt in the past ("What was I to...?"). The negative is **nōn**.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Quem **vocem**?', en: 'Whom am I to call?' },
            { la: 'Ubi **dormiāmus**?', en: 'Where are we to sleep?' },
            { la: 'Quō **fugerem**?', en: 'Where was I to flee?' },
            { la: 'Cūr **nōn ambulēmus**?', en: 'Why should we not take a walk?' },
          ],
        },
      ],
    },
    {
      heading: 'Telling them apart',
      blocks: [
        {
          kind: 'table',
          head: ['Use', 'Look for', 'English', 'Negative'],
          rows: [
            ['Hortatory', '1st person plural, present', 'Let us...', 'nē'],
            ['Jussive', '3rd person, present', 'Let him... / Let them...', 'nē'],
            ['Prohibitive', '2nd person, perfect, with nē', 'Do not...!', 'nē'],
            ['Optative', 'a wish, often with utinam; present, imperfect or pluperfect', 'May... / If only...', 'nē'],
            ['Deliberative', 'a question; present or imperfect', 'What am I to...? / What was I to...?', 'nōn'],
          ],
        },
        {
          kind: 'tip',
          title: 'nē or nōn?',
          text: 'Exhortations, commands, prohibitions and wishes all take **nē**. The deliberative is the only one that takes **nōn**: *Cūr nōn ambulēmus?*, never nē. If a subjunctive main verb sits in a question, think deliberative and nōn.',
        },
      ],
    },
  ],
  check: ['m2-202', 'm2-306', 'm2-403', 'm2-505', 'm2-601'],
};
