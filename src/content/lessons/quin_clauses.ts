import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'quin_clauses',
  title: 'Quīn Clauses',
  summary:
    'Quīn introduces a subjunctive clause after a negative expression of doubting or preventing. Learn what it means after each kind of verb, and what Latin uses instead when the main verb is not negative.',
  sections: [
    {
      heading: 'Quīn needs a negative',
      blocks: [
        {
          kind: 'p',
          text: 'Quīn comes from an old word for "how" joined to a negative, so it carries a "not" inside it. That is why a quīn clause depends on a main clause that is itself **negative**: nōn, nēmō, nihil, or a question that expects the answer "no", such as quis dubitat? ("who doubts?", meaning "no one doubts").',
        },
        {
          kind: 'p',
          text: 'The verb in a quīn clause is **subjunctive** and follows the sequence of tenses: present or perfect after a primary main verb, imperfect or pluperfect after a secondary one.',
        },
      ],
    },
    {
      heading: 'Doubting: nōn dubitō quīn',
      blocks: [
        {
          kind: 'p',
          text: 'After a **negative expression of doubting** (nōn dubitō, nēmō dubitat, quis dubitat?), quīn means simply **"that"**. English does not translate its built-in negative: "I do not doubt **that** ...".',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Nōn dubitō **quīn** frāter tuus **vēnerit**.',
              en: 'I do not doubt that your brother has come.',
              note: 'Primary, time before: perfect subjunctive.',
            },
            {
              la: 'Nēmō dubitābat **quīn** nūntius vērum **dīceret**.',
              en: 'No one doubted that the messenger was telling the truth.',
              note: 'Secondary, same time: imperfect subjunctive.',
            },
            {
              la: 'Quis dubitat **quīn** hic labor difficilis **sit**?',
              en: 'Who doubts that this task is difficult?',
              note: 'A question expecting "no one" counts as a negative.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'A **positive** dubitō ("I doubt") does not take quīn. It takes an indirect question, usually with **num** ("whether"). And nōn dubitō with an **infinitive** means "I do not hesitate to ...".',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Dubitō **num** haec fābula vēra **sit**.', en: 'I doubt whether this story is true.' },
            { la: 'Nōn dubitāvit flūmen **trānsīre**.', en: 'He did not hesitate to cross the river.' },
          ],
        },
      ],
    },
    {
      heading: 'Preventing: quīn, quōminus and nē',
      blocks: [
        {
          kind: 'p',
          text: 'Verbs of **preventing, hindering and deterring** (impediō, dēterreō, retineō, obstō) take a subjunctive clause that English translates **"from ...ing"**. Which word introduces it depends on whether the main verb is negative.',
        },
        {
          kind: 'table',
          head: ['Main verb', 'Clause begins with', 'Example'],
          rows: [
            ['positive: impedit, dēterret', 'nē or quōminus', 'He prevents me from going.'],
            ['negative: nōn impedit, nihil impedit, nēmō dēterret', 'quīn or quōminus', 'Nothing prevents me from going.'],
          ],
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Tempestās nōs impedīvit **nē nāvigārēmus**.',
              en: 'The storm prevented us from sailing.',
            },
            {
              la: 'Morbus eum impedit **quōminus labōret**.',
              en: 'Illness prevents him from working.',
            },
            {
              la: 'Nēmō mē dēterrēbit **quīn** vērum **dīcam**.',
              en: 'No one will deter me from telling the truth.',
              note: 'Negative main clause, so quīn.',
            },
            {
              la: 'Nihil obstābat **quīn** mīlitēs flūmen **trānsīrent**.',
              en: 'Nothing stood in the way of the soldiers crossing the river.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Translate the subjunctive with an English "-ing" form after "from": quīn dīcam, "from telling". Do not translate it as "that".',
        },
      ],
    },
    {
      heading: 'Other negative expressions',
      blocks: [
        {
          kind: 'p',
          text: 'A few fixed phrases also take quīn. Here quīn keeps its "not", so English needs "that ... not" or a positive rewording.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: '**Fierī nōn potest quīn** dē hāc rē **audiās**.',
              en: 'It cannot be that you do not hear about this. (You are bound to hear about this.)',
            },
            {
              la: 'Nēmō est **quīn** hoc **sciat**.',
              en: 'There is no one who does not know this.',
              note: 'Here quīn stands for quī nōn.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Recognising a quīn clause',
      blocks: [
        {
          kind: 'table',
          head: ['Main clause', 'Construction', 'English'],
          rows: [
            ['nōn dubitō, nēmō dubitat, quis dubitat?', 'quīn + subjunctive', 'that ...'],
            ['dubitō (positive)', 'num + subjunctive', 'whether ...'],
            ['negative verb of preventing', 'quīn or quōminus + subjunctive', 'from ...ing'],
            ['positive verb of preventing', 'nē or quōminus + subjunctive', 'from ...ing'],
            ['fierī nōn potest, nēmō est', 'quīn + subjunctive', 'that ... not, who ... not'],
          ],
        },
        {
          kind: 'tip',
          title: 'Look for the negative first',
          text: 'Quīn appears only after a **negative** or a question expecting "no". If the main clause says *nōn dubitō* or *nēmō dubitat*, quīn means "that". If it says plain *dubitō*, expect *num*, "whether", and an indirect question instead. If it is a verb of preventing, translate "from ...ing", and expect quīn only when that verb is negated.',
        },
      ],
    },
  ],
  check: ['m8-201', 'm8-203', 'm8-302', 'm8-303'],
};
