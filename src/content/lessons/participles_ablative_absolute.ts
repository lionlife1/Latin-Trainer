import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'participles_ablative_absolute',
  title: 'Participles and the Ablative Absolute',
  summary:
    'A participle is a verbal adjective: it agrees with a noun like an adjective, but it has tense and voice like a verb. Its tense shows time relative to the main verb. A noun and participle in the ablative, standing apart from the rest of the sentence, form an ablative absolute.',
  sections: [
    {
      heading: 'Present Active, Perfect Passive and Future Active Participles',
      blocks: [
        {
          kind: 'p',
          text: 'An ordinary Latin verb has three participles. The **present active** participle means "...ing". The **perfect passive** participle means "having been ...ed". The **future active** participle means "about to ..." or "going to ...". (The gerundive, sometimes called the future passive participle, has its own lesson in M12.)',
        },
        {
          kind: 'table',
          caption: 'Forming the participles',
          head: ['Conjugation', 'Principal parts', 'Present active', 'Perfect passive', 'Future active'],
          rows: [
            ['1st', 'laudō, laudāre, laudāvī, laudātum', 'laudāns, laudantis', 'laudātus, -a, -um', 'laudātūrus, -a, -um'],
            ['2nd', 'habeō, habēre, habuī, habitum', 'habēns, habentis', 'habitus, -a, -um', 'habitūrus, -a, -um'],
            ['3rd', 'dūcō, dūcere, dūxī, ductum', 'dūcēns, dūcentis', 'ductus, -a, -um', 'ductūrus, -a, -um'],
            ['3rd -iō', 'faciō, facere, fēcī, factum', 'faciēns, facientis', 'factus, -a, -um', 'factūrus, -a, -um'],
            ['4th', 'mūniō, mūnīre, mūnīvī, mūnītum', 'mūniēns, mūnientis', 'mūnītus, -a, -um', 'mūnītūrus, -a, -um'],
          ],
        },
        {
          kind: 'p',
          text: 'The **present participle** adds **-ns** to the present stem: -āns in the 1st conjugation, -ēns in the 2nd and 3rd, -iēns in 3rd -iō and 4th. The vowel is long before -ns and short before -nt-, so the genitive is laudantis, dūcentis. It declines like a 3rd-declension adjective, with genitive plural **-ntium**. In the ablative singular it ends in **-e** when it acts as a participle (and always in an ablative absolute), but **-ī** when it is used as a plain adjective.',
        },
        {
          kind: 'p',
          text: 'The **perfect passive** and **future active** participles both come from the **fourth principal part**. Drop the -um and add **-us** for the perfect passive or **-ūrus** for the future active; both decline like bonus, -a, -um. Use the fourth principal part even when it looks irregular: ferō, ferre, tulī, lātum gives lātus and lātūrus. The verb **sum** has no ordinary present participle and no perfect passive, but its future participle is **futūrus**, "about to be".',
        },
      ],
    },
    {
      heading: 'Participles of Deponent Verbs',
      blocks: [
        {
          kind: 'p',
          text: 'A deponent verb is passive in form but active in meaning, and its participles follow the meaning. The **perfect participle** of a deponent is its last principal part without sum, and it is **active**: locūtus means "having spoken", not "having been spoken". Deponents also have an ordinary present participle (loquēns, "speaking") and future participle (locūtūrus, "about to speak").',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Lēgātus, multa **locūtus**, cōnsēdit.',
              en: 'Having said many things, the envoy sat down.',
              note: 'loquor, loquī, locūtus sum',
            },
            {
              la: 'Mercātor, Rōmā **profectus**, Capuam pervēnit.',
              en: 'Having set out from Rome, the merchant reached Capua.',
              note: 'proficīscor, proficīscī, profectus sum',
            },
          ],
        },
        {
          kind: 'p',
          text: 'This is worth noticing because ordinary verbs have **no perfect active participle**. Latin cannot say "having captured the city" with a single participle of capiō; it uses an ablative absolute or a cum clause instead. Only deponents can say "having ...ed" in one word.',
        },
      ],
    },
    {
      heading: 'Agreement and Relative Time',
      blocks: [
        {
          kind: 'p',
          text: 'A participle is an adjective, so it **agrees** with its noun in gender, number and case. Use the ending to find the noun it belongs to, even when the two are far apart.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Pater fīliam **lacrimantem** vīdit.',
              en: 'The father saw his daughter crying.',
              note: 'lacrimantem is accusative singular, so it goes with fīliam, not pater.',
            },
            {
              la: 'Oppidānī **territī** portās clausērunt.',
              en: 'The townspeople, terrified, shut the gates.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'A participle has no time of its own. Its tense shows time **relative to the main verb**: the present participle shows the **same time**, the perfect shows time **before**, and the future shows time **after**.',
        },
        {
          kind: 'table',
          head: ['Participle', 'Time compared with the main verb', 'Literal English', 'Often better as'],
          rows: [
            ['Present active', 'same time', '...ing', 'while / as he is (was) ...ing'],
            ['Perfect passive', 'before', 'having been ...ed', 'after (when) he had been ...ed'],
            ['Future active', 'after', 'about to ..., going to ...', 'as he was about to ..., intending to ...'],
          ],
        },
        {
          kind: 'examples',
          items: [
            { la: 'Fēminae **flentēs** ex urbe exeunt.', en: 'The women go out of the city weeping.' },
            {
              la: 'Fēminae **flentēs** ex urbe exiērunt.',
              en: 'The women went out of the city weeping (while they were weeping).',
              note: 'Same participle; the main verb is now past, so the English shifts to "were".',
            },
            {
              la: 'Captīvī **līberātī** grātiās ēgērunt.',
              en: 'Having been freed (after they had been freed), the prisoners gave thanks.',
            },
            {
              la: 'Nautae **nāvigātūrī** sacrificium fēcērunt.',
              en: 'As they were about to sail, the sailors made a sacrifice.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Ablative Absolute',
      blocks: [
        {
          kind: 'p',
          text: 'An **ablative absolute** is a noun (or pronoun) and a participle, both in the **ablative**, with no preposition. "Absolute" means "loosened": the phrase is not the subject or object of the main verb and is not governed by any word in the sentence. It sets the scene for the main clause.',
        },
        {
          kind: 'p',
          text: 'Translate it literally first ("the gates having been shut"), then turn it into an English clause. The participle still shows relative time, and the context tells you the best linking word: **when, after, while, since, although** or **if**.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: '**Portīs clausīs**, oppidānī sē dēfendērunt.',
              en: 'When the gates had been shut, the townspeople defended themselves.',
            },
            {
              la: '**Patre dormiente**, puerī ē domō clam exiērunt.',
              en: 'While their father was sleeping, the boys secretly went out of the house.',
              note: 'Present participle in an ablative absolute: -e, not -ī.',
            },
            {
              la: '**Sōle oriente**, nautae nāvem solvērunt.',
              en: 'As the sun was rising, the sailors set sail.',
            },
            {
              la: '**Multīs vulnerātīs**, Rōmānī tamen nōn cessērunt.',
              en: 'Although many had been wounded, the Romans nevertheless did not give way.',
              note: 'tamen points to "although".',
            },
            {
              la: '**Pecūniā āmissā**, mercātor domum rediit.',
              en: 'Having lost his money, the merchant went home.',
              note: 'English often turns the passive into an active: "the money having been lost" becomes "having lost his money".',
            },
          ],
        },
      ],
    },
    {
      heading: 'Ablative Absolute without a Participle',
      blocks: [
        {
          kind: 'p',
          text: 'Because **sum** has no present participle, Latin can make an ablative absolute from **two nouns**, or a **noun and an adjective**, with no participle at all. Supply "being" in a literal translation, then find a natural English phrase.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: '**Tarquiniō rēge**, Rōma nōndum lībera erat.',
              en: 'When Tarquinius was king, Rome was not yet free.',
              note: 'Literally "Tarquinius being king".',
            },
            { la: '**Tē duce**, vincēmus.', en: 'With you as leader, we will win.' },
            { la: '**Patre invītō**, fīlius mīles factus est.', en: 'Against his father\'s will, the son became a soldier.' },
          ],
        },
      ],
    },
    {
      heading: 'Is it really absolute?',
      blocks: [
        {
          kind: 'p',
          text: 'Latin does **not** use an ablative absolute when its noun is also the subject or object of the main verb. The participle simply agrees with that noun. And a noun and participle in the ablative after a **preposition** (in, ex, cum, ā) are an ordinary prepositional phrase, not an ablative absolute.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Rōmānī oppidum **captum** incendērunt.',
              en: 'The Romans set fire to the town they had captured.',
              note: 'oppidum is the object of incendērunt, so no ablative absolute.',
            },
            {
              la: 'Cīvēs **ex oppidō captō** fūgērunt.',
              en: 'The citizens fled from the captured town.',
              note: 'Governed by ex: not absolute.',
            },
          ],
        },
        {
          kind: 'tip',
          title: 'Three traps',
          text: 'In an ablative absolute the present participle ends in **-e** (*patre dormiente*), not -ī. A **deponent** perfect participle is **active**: *secūtus* is "having followed", not "having been followed". And a present participle with a **past** main verb is translated "while they **were** ...ing", not "are".',
        },
      ],
    },
  ],
  check: ['m10-203', 'm10-303', 'm10-401', 'm10-501', 'm10-502'],
};
