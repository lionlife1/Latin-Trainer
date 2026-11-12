import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'purpose_result_indirect',
  title: 'Purpose, Result and Indirect Command',
  summary:
    'Three kinds of clause begin with ut and use the subjunctive. Learn to tell them apart from the words in the main clause and from the negative each one takes.',
  sections: [
    {
      heading: 'Three ut clauses',
      blocks: [
        {
          kind: 'p',
          text: 'A purpose clause, a result clause and an indirect command can look identical: **ut + subjunctive**. You cannot tell them apart from the ut clause alone. Look back at the **main clause** for a clue, and look at the **negative**.',
        },
        {
          kind: 'p',
          text: 'All three follow the sequence of tenses with the "same time" column: **present subjunctive** after a primary main verb, **imperfect subjunctive** after a secondary one. (A result clause after a past main verb sometimes uses the perfect subjunctive to stress that the result really happened, but present and imperfect are the usual pattern.)',
        },
      ],
    },
    {
      heading: 'Purpose Clauses',
      blocks: [
        {
          kind: 'p',
          text: 'A purpose clause says **why** someone does something: the aim of the action. It uses **ut** for a positive purpose and **nē** for a negative one. English often uses "to" or "in order to", or "so that... may / might". For nē, say "so that... not" or "lest".',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Pater fīliō pecūniam dat **ut librōs emat**.',
              en: 'The father gives his son money so that he may buy books.',
            },
            {
              la: 'Ad forum festīnāvimus **ut amīcōs vidērēmus**.',
              en: 'We hurried to the forum to see our friends.',
            },
            {
              la: 'Portās claudunt **nē hostēs intrent**.',
              en: 'They are shutting the gates so that the enemy may not enter.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'There is no special signal word in the main clause. If nothing points to a result or a command and the clause answers "why?", it is purpose. Classical Latin prose does not use a plain infinitive to show purpose; the usual way is ut + subjunctive.',
        },
        {
          kind: 'p',
          text: 'When the main clause has a noun the purpose clause can refer back to, Latin often uses a relative pronoun instead of ut. This is a **relative clause of purpose**, and you will study it fully in M9.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Caesar equitēs praemīsit **quī locum explōrārent**.',
              en: 'Caesar sent cavalry ahead to scout the place.',
              note: 'quī refers back to equitēs.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Result Clauses',
      blocks: [
        {
          kind: 'p',
          text: 'A result clause says what **happened because of** something: the consequence. The main clause almost always contains a signal word meaning "so" or "such".',
        },
        {
          kind: 'table',
          caption: 'Result signal words in the main clause',
          head: ['Signal word', 'Meaning'],
          rows: [
            ['tam', 'so (with adjectives and adverbs)'],
            ['tantus, -a, -um', 'so great, such a great'],
            ['tālis, -e', 'such, of such a kind'],
            ['ita', 'so, in such a way'],
            ['sīc', 'so, thus'],
            ['adeō', 'to such an extent, so much'],
          ],
        },
        {
          kind: 'p',
          text: 'The positive is **ut**. The negative keeps the ut and adds a negative word: **ut nōn**, **ut nēmō** ("that no one"), **ut nihil** ("that nothing"), **ut numquam** ("that never"). Translate the verb as a plain English verb ("beat", "hear"), not with "may" or "might", because the result is a fact.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Puella **tam** celeriter cucurrit **ut omnēs superāret**.',
              en: 'The girl ran so fast that she beat everyone.',
            },
            {
              la: '**Tantus** clāmor est **ut nihil audiāmus**.',
              en: 'The noise is so great that we hear nothing.',
            },
            {
              la: 'Mīlitēs **adeō** territī erant **ut nōn pugnārent**.',
              en: 'The soldiers were so frightened that they did not fight.',
            },
            {
              la: '**Tālis** vir est **ut omnēs eum ament**.',
              en: 'He is such a man that everyone loves him.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Some verbs take a whole result clause as their subject or object: **accidit ut** ("it happens that"), **fit ut** ("it comes about that"), **efficiō ut** ("I bring it about that"). This is a **substantive clause of result**. It still uses ut and ut nōn.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Accidit **ut cōnsul aegrōtāret**.', en: 'It happened that the consul was ill.' },
          ],
        },
      ],
    },
    {
      heading: 'Indirect Commands',
      blocks: [
        {
          kind: 'p',
          text: 'An indirect command reports an order, request, warning or piece of advice. The main verb is a verb of **ordering, asking, begging, urging, warning or persuading**. It uses **ut** for a positive command and **nē** for a negative one. English usually translates with "to" or "not to": "I begged them not to leave."',
        },
        {
          kind: 'table',
          caption: 'Common verbs that take an indirect command',
          head: ['Verb', 'Meaning', 'Person told or asked'],
          rows: [
            ['imperō, imperāre', 'order, command', 'dative'],
            ['persuādeō, persuādēre', 'persuade', 'dative'],
            ['moneō, monēre', 'warn, advise', 'accusative'],
            ['hortor, hortārī', 'urge, encourage', 'accusative'],
            ['ōrō, ōrāre', 'beg', 'accusative'],
            ['rogō, rogāre', 'ask', 'accusative'],
            ['petō, petere', 'ask, request', 'ā / ab + ablative'],
          ],
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Dux mīlitibus **imperat ut castra mūniant**.',
              en: 'The general orders the soldiers to fortify the camp.',
            },
            {
              la: 'Amīcum **hortātus sum ut fortis esset**.',
              en: 'I urged my friend to be brave.',
            },
            {
              la: 'Nautās **ōrāvimus nē nāvem relinquerent**.',
              en: 'We begged the sailors not to abandon the ship.',
            },
          ],
        },
        {
          kind: 'tip',
          title: 'iubeō takes an infinitive',
          text: '**iubeō** ("order") does not take ut. It takes an accusative and an infinitive, just like English: *Dux mīlitēs iussit castra mūnīre*, "The general ordered the soldiers to fortify the camp." Its opposite **vetō** ("forbid") works the same way.',
        },
      ],
    },
    {
      heading: 'Telling them apart',
      blocks: [
        {
          kind: 'table',
          head: ['', 'Purpose', 'Result', 'Indirect command'],
          rows: [
            ['Clue in main clause', 'none; answers "why?"', 'tam, tantus, tālis, ita, sīc, adeō', 'verb of ordering, asking, urging'],
            ['Positive', 'ut', 'ut', 'ut'],
            ['Negative', 'nē', 'ut nōn, ut nēmō, ut nihil', 'nē'],
            ['English', 'to..., so that... may', 'so... that (plain verb)', 'to..., not to...'],
          ],
        },
        {
          kind: 'tip',
          title: 'Check the main clause, then the negative',
          text: 'First scan the main clause: a "so" word means **result**, a verb of ordering or asking means **indirect command**, and nothing at all means **purpose**. Then check the negative. Result is the only one that keeps ut and says **ut nōn**; purpose and indirect command both use **nē**. In a purpose clause, nē means "so that... not" or "lest", never just "that".',
        },
      ],
    },
  ],
  check: ['m3-204', 'm3-302', 'm3-401', 'm3-604', 'm3-706'],
};
