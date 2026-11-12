import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'case_uses',
  title: 'Noun Case Uses',
  summary:
    'Each case does several jobs. To name the job, look at the noun\'s meaning (a person, a thing, a time, a place), any preposition, and the verb or adjective it goes with.',
  sections: [
    {
      heading: 'Ablative: Means, Manner, Accompaniment',
      blocks: [
        {
          kind: 'p',
          text: 'Three ablatives all translate as "with", so ask what kind of "with" it is. **Means** is the tool or thing used, with **no preposition**. **Manner** says **how** something is done; it takes **cum**, but when the noun has an adjective, cum may be left out or placed between the adjective and the noun. **Accompaniment** is a person who goes along, with **cum**.',
        },
        {
          kind: 'table',
          head: ['Use', 'Signal', 'Example', 'English'],
          rows: [
            ['Means', 'a thing used; no preposition', 'Puer canem **baculō** pepulit.', 'The boy drove off the dog with a stick.'],
            ['Manner', 'how it was done; cum, or adjective + (cum)', 'Epistulam **magnā cum cūrā** scrīpsit.', 'He wrote the letter with great care.'],
            ['Accompaniment', 'cum + a person', 'Mārcus **cum frātre** ambulābat.', 'Marcus was walking with his brother.'],
          ],
        },
        {
          kind: 'p',
          text: 'Means **never** takes cum. Without an adjective, manner needs cum: **cum cūrā**, "carefully". With an adjective, both **magnā cum cūrā** and **magnā cūrā** are good Latin.',
        },
      ],
    },
    {
      heading: 'Ablative: Time When and Time Within Which',
      blocks: [
        {
          kind: 'p',
          text: 'A plain ablative of a time word, with no preposition, says **when** something happened, or the period **within which** it happened.',
        },
        {
          kind: 'table',
          head: ['Use', 'Signal', 'Example', 'English'],
          rows: [
            ['Time when', 'a point in time', '**Mediā nocte** profectī sunt.', 'They set out at midnight.'],
            ['Time within which', 'a stretch of time', '**Duābus hōrīs** redībō.', 'I will return within two hours.'],
          ],
        },
        {
          kind: 'p',
          text: 'How **long** something lasts is not ablative but accusative (see the last section).',
        },
      ],
    },
    {
      heading: 'Ablative: Agent, Comparison, Separation, Cause; Ablative of Description',
      blocks: [
        {
          kind: 'table',
          head: ['Use', 'Signal', 'Example', 'English'],
          rows: [
            ['Agent', 'ā/ab + a person, with a passive verb', 'Urbs **ā Gallīs** capta est.', 'The city was captured by the Gauls.'],
            ['Comparison', 'after a comparative, instead of quam', 'Ferrum **aurō** dūrius est.', 'Iron is harder than gold.'],
            ['Separation', 'verbs of freeing, depriving, keeping away', 'Cōnsul cīvēs **metū** līberāvit.', 'The consul freed the citizens from fear.'],
            ['Cause', 'the reason, often with verbs of feeling', 'Puella **dolōre** lacrimābat.', 'The girl was weeping from grief.'],
            ['Description', 'noun + adjective describing a person', 'Senex erat **longā barbā**.', 'The old man had a long beard.'],
          ],
        },
        {
          kind: 'p',
          text: 'The agent is always a **person** (or animal) and needs **ā/ab**. A thing that causes a passive action is a bare ablative of means. When the first thing compared is nominative or accusative, the ablative of comparison can replace quam + the same case: *Ferrum dūrius est quam aurum* says the same thing. With separation, a preposition (ā, ab, ē, ex) is sometimes added, and it is regular when the separation is from a person.',
        },
      ],
    },
    {
      heading: 'Dative: Indirect Object, Special Verbs, Possession, Purpose and Reference',
      blocks: [
        {
          kind: 'p',
          text: 'The dative names the person (or thing) **to** or **for** whom something is, or is done.',
        },
        {
          kind: 'table',
          head: ['Use', 'Signal', 'Example', 'English'],
          rows: [
            ['Indirect object', 'verbs of giving, showing, telling', 'Pater **fīliō** equum dedit.', 'The father gave a horse to his son.'],
            ['With a special verb', 'pāreō, crēdō, parcō, noceō, faveō, persuādeō...', 'Mīlitēs **ducī** pāruērunt.', 'The soldiers obeyed their general.'],
            ['Possession', 'dative + a form of sum', '**Huic puerō** est canis.', 'This boy has a dog.'],
            ['Purpose', 'the job something does; often a double dative', 'Haec rēs **mihi cūrae** est.', 'This matter is a concern to me.'],
            ['Reference', 'the person who benefits or is concerned', 'Nōn **mihi** sed **patriae** labōrō.', 'I work not for myself but for my country.'],
          ],
        },
        {
          kind: 'p',
          text: 'Special verbs take a dative where English has a direct object, so learn them as a list. A **double dative** pairs a dative of purpose with a dative of the person concerned: in *mihi cūrae*, cūrae is purpose ("as a concern") and mihi says to whom.',
        },
      ],
    },
    {
      heading: 'Genitive: Partitive and Description',
      blocks: [
        {
          kind: 'table',
          head: ['Use', 'Signal', 'Example', 'English'],
          rows: [
            ['Partitive', 'the whole that a part is taken from', 'Quis **vestrum** hoc vīdit?', 'Which of you saw this?'],
            ['Partitive', 'after words of quantity: satis, nihil, pars', 'Satis **pecūniae** nōn habēmus.', 'We do not have enough money.'],
            ['Description', 'noun + adjective describing a person', 'Erat homō **magnae prūdentiae**.', 'He was a man of great good sense.'],
            ['Description', 'measure or age, with a number', 'Puer **decem annōrum** aderat.', 'A boy ten years old was present.'],
          ],
        },
        {
          kind: 'p',
          text: 'The partitive forms of the pronouns are **nostrum** and **vestrum** ("of us", "of you"). With numbers Latin usually uses **ex** or **dē** instead of a partitive genitive: *ūnus ex mīlitibus*, "one of the soldiers".',
        },
      ],
    },
    {
      heading: 'Accusative: Extent and Place to Which',
      blocks: [
        {
          kind: 'table',
          head: ['Use', 'Signal', 'Example', 'English'],
          rows: [
            ['Extent of time', 'how long', '**Multōs annōs** Rōmae habitāvit.', 'He lived in Rome for many years.'],
            ['Extent of space', 'how far, how high, how wide', 'Fossa **vīgintī pedēs** lāta erat.', 'The ditch was twenty feet wide.'],
            ['Place to which', 'in or ad + accusative', 'Nautae **in Graeciam** nāvigāvērunt.', 'The sailors sailed to Greece.'],
            ['Place to which', 'city, small island, domus, rūs: no preposition', 'Mercātor **Corinthum** nāvigāvit.', 'The merchant sailed to Corinth.'],
          ],
        },
        {
          kind: 'tip',
          title: 'Three common mix-ups',
          text: '**Time:** the accusative says **how long** (*tōtum diem*, "all day"); the ablative says **when** or **within which** (*eō diē*, "on that day"). **Agent or means:** a person doing a passive action is ā/ab + ablative, a thing used is a bare ablative: *Rēx ā servō venēnō necātus est*, "The king was killed by a slave with poison." **Description:** a quality with an adjective can be **genitive or ablative**, and the ablative needs no cum (*vir summā fortitūdine* or *vir summae fortitūdinis*, "a man of the greatest bravery"); a number or measure uses the genitive.',
        },
      ],
    },
  ],
  check: ['m13-102', 'm13-202', 'm13-601', 'm13-602', 'm13-603'],
};
