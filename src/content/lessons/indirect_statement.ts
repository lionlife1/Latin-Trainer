import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'indirect_statement',
  title: 'Indirect Statement',
  summary:
    'After a verb of saying, thinking, knowing or perceiving, Latin reports a statement with an accusative subject and an infinitive. The tense of the infinitive shows time relative to the main verb.',
  sections: [
    {
      heading: 'Verbs of Saying, Thinking, Knowing and Perceiving',
      blocks: [
        {
          kind: 'p',
          text: 'A direct statement gives someone\'s exact words: "The enemy are coming." An **indirect statement** reports them: "He says **that** the enemy are coming." In Latin it follows a verb of **saying, thinking, knowing or perceiving**.',
        },
        {
          kind: 'table',
          caption: 'Common verbs that introduce indirect statement',
          head: ['Kind', 'Verbs'],
          rows: [
            ['Saying', 'dīcō, nūntiō, respondeō, scrībō, negō, prōmittō, polliceor'],
            ['Thinking', 'putō, crēdō, exīstimō, arbitror, spērō'],
            ['Knowing', 'sciō, nesciō, intellegō'],
            ['Perceiving', 'videō, audiō, sentiō'],
          ],
        },
        {
          kind: 'p',
          text: 'Keep these apart from the verbs that introduce other reported speech. A verb of **commanding or asking** someone to do something (imperō, ōrō, hortor, rogō) takes an **indirect command**: ut or nē + subjunctive. A verb of **asking a question** (quaerō, rogō) takes an **indirect question**: a question word + subjunctive.',
        },
      ],
    },
    {
      heading: 'Accusative Subject + Infinitive',
      blocks: [
        {
          kind: 'p',
          text: 'Latin has **no word for "that"** in an indirect statement. Instead, the subject of the reported statement goes into the **accusative**, and its verb becomes an **infinitive**. Any adjective or participle describing that subject is accusative too.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Putō **puerum aegrum esse**.',
              en: 'I think that the boy is sick.',
              note: 'Direct: Puer aeger est.',
            },
            {
              la: 'Sentiō **mē dēcipī**.',
              en: 'I realise that I am being deceived.',
            },
            {
              la: 'Explōrātor nūntiāvit **Gallōs flūmen trānsīre**.',
              en: 'The scout reported that the Gauls were crossing the river.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'English usually adds "that", but it can be left out: "I think the boy is sick." Never translate the infinitive as "to" here.',
        },
      ],
    },
    {
      heading: 'The six infinitives',
      blocks: [
        {
          kind: 'p',
          text: 'A Latin verb has three tenses of infinitive, each active and passive. The perfect passive and the future active are built from participles, so they **agree with the accusative subject** in gender, number and case.',
        },
        {
          kind: 'table',
          caption: 'Infinitives of laudō, laudāre, laudāvī, laudātum',
          head: ['Tense', 'Active', 'Passive', 'Time'],
          rows: [
            ['Present', 'laudāre, to praise', 'laudārī, to be praised', 'same time'],
            ['Perfect', 'laudāvisse, to have praised', 'laudātus, -a, -um esse, to have been praised', 'before'],
            ['Future', 'laudātūrus, -a, -um esse, to be about to praise', 'laudātum īrī (rare)', 'after'],
          ],
        },
        {
          kind: 'p',
          text: 'The **present passive** infinitive ends in -ārī, -ērī and -īrī in the 1st, 2nd and 4th conjugations, but in plain **-ī** in the 3rd: dūcī, "to be led", capī, "to be taken". The **perfect active** is the perfect stem + **-isse**: cēpisse, vīdisse. In the participle forms, **esse** is often left out.',
        },
        {
          kind: 'p',
          text: 'A **deponent** has a present infinitive that is passive in form but active in meaning (hortārī, "to encourage"; loquī, "to speak"). Its perfect infinitive is its perfect participle + esse (locūtus esse, "to have spoken"), and its future is the usual future active (locūtūrus esse).',
        },
      ],
    },
    {
      heading: 'Present Infinitive: Same Time; Perfect: Time Before; Future: Time After',
      blocks: [
        {
          kind: 'p',
          text: 'The infinitive does not show time on its own. Like a participle, it shows time **relative to the main verb**. The English tense then depends on whether the main verb is present or past.',
        },
        {
          kind: 'table',
          head: ['Infinitive', 'Time', 'After dīcit ("he says")', 'After dīxit ("he said")'],
          rows: [
            ['Present: advenīre', 'same time', 'that the consul is arriving', 'that the consul was arriving'],
            ['Perfect: advēnisse', 'before', 'that the consul has arrived', 'that the consul had arrived'],
            ['Future: adventūrum esse', 'after', 'that the consul will arrive', 'that the consul would arrive'],
          ],
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Crēdēbant nāvēs ā pīrātīs **dēlētās esse**.',
              en: 'They believed that the ships had been destroyed by the pirates.',
              note: 'dēlētās agrees with nāvēs, feminine accusative plural.',
            },
            {
              la: 'Spērābant sē mox domum **reditūrōs esse**.',
              en: 'They hoped that they would soon return home.',
            },
            {
              la: 'Pollicitus est sē pecūniam **redditūrum esse**.',
              en: 'He promised that he would give back the money.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Verbs of **hoping, promising and threatening** look ahead, so they take the **future infinitive** with a subject accusative. English says "I hope to win" or "he promised to pay"; Latin says "I hope that I will win", "he promised that he would pay".',
        },
      ],
    },
    {
      heading: 'Reflexive sē and suus',
      blocks: [
        {
          kind: 'p',
          text: 'When the subject of the infinitive is the **same person** as the subject of the main verb, Latin uses the reflexive **sē**. When it is **someone else**, Latin uses a form of **is, ea, id** (eum, eam, eōs, eās). In the same way, the possessive **suus** means "his own, her own, their own", pointing back to the main subject, while **eius** and **eōrum** mean someone else\'s.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Rēgīna crēdēbat **sē** tūtam esse.', en: 'The queen believed that she (herself) was safe.' },
            { la: 'Rēgīna crēdēbat **eam** tūtam esse.', en: 'The queen believed that she (another woman) was safe.' },
            { la: 'Pater dīxit **suam** domum ārdēre.', en: 'The father said that his own house was on fire.' },
            { la: 'Pater dīxit domum **eius** ārdēre.', en: 'The father said that his (another man\'s) house was on fire.' },
            {
              la: 'Mīlitēs dīxērunt **sē** fessōs esse.',
              en: 'The soldiers said that they were tired.',
              note: 'sē is the same form in the singular and plural; fessōs shows it is masculine plural.',
            },
          ],
        },
      ],
    },
    {
      heading: 'negō: Say That ... Not',
      blocks: [
        {
          kind: 'p',
          text: 'To report a negative statement, Latin normally uses **negō**, "say that ... not" or "deny", rather than dīcō with nōn. The "not" belongs in the English reported clause.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Puer **negat** sē pecūniam cēpisse.',
              en: 'The boy says that he did not take the money.',
              note: 'Or: "The boy denies that he took the money."',
            },
            {
              la: '**Negāvērunt** hostēs pācem petītūrōs esse.',
              en: 'They said that the enemy would not ask for peace.',
            },
          ],
        },
        {
          kind: 'tip',
          title: 'No "that" word, and watch the endings',
          text: 'Do not write ut or quod for "that" after dīcō: the subject goes into the **accusative** and the verb into the **infinitive**. The participle in a compound infinitive must agree with that accusative subject: *Spērō amīcum mē adiūtūrum esse*, "I hope that my friend will help me", not adiūtūrus. And after a verb of hoping or promising, use the **future** infinitive, even where English says "to".',
        },
      ],
    },
  ],
  check: ['m11-103', 'm11-303', 'm11-503', 'm11-601', 'm11-701'],
};
