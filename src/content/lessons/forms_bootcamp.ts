import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'forms_bootcamp',
  title: 'The Four Subjunctive Tenses',
  summary:
    'The subjunctive has four tenses: present, imperfect, perfect and pluperfect. Learn to build each one in the active and the passive, and to tell a subjunctive from an indicative on sight.',
  sections: [
    {
      heading: 'Present Active Subjunctive',
      blocks: [
        {
          kind: 'p',
          text: "Every subjunctive in the later modules uses one of four tenses: present, imperfect, perfect or pluperfect. There is no future subjunctive. A subjunctive has no single English meaning; how you translate it depends on the construction it sits in. Here you only learn to build and recognise the forms.",
        },
        {
          kind: 'p',
          text: 'To make the present active subjunctive, change the vowel in front of the personal ending, then add the active endings **-m, -s, -t, -mus, -tis, -nt**. The first person singular ends in **-m**, not -ō.',
        },
        {
          kind: 'table',
          caption: 'Present active subjunctive',
          head: ['Person', 'amō (1st)', 'moneō (2nd)', 'regō (3rd)', 'audiō (4th)'],
          rows: [
            ['1st sg.', 'amem', 'moneam', 'regam', 'audiam'],
            ['2nd sg.', 'amēs', 'moneās', 'regās', 'audiās'],
            ['3rd sg.', 'amet', 'moneat', 'regat', 'audiat'],
            ['1st pl.', 'amēmus', 'moneāmus', 'regāmus', 'audiāmus'],
            ['2nd pl.', 'amētis', 'moneātis', 'regātis', 'audiātis'],
            ['3rd pl.', 'ament', 'moneant', 'regant', 'audiant'],
          ],
        },
        {
          kind: 'tip',
          title: 'We fear a liar',
          text: 'The vowels run *wE fEAr A lIAr*: **e** in the 1st conjugation (amem), **ea** in the 2nd (moneam), **a** in the 3rd (regam), **ia** in the 3rd -iō and the 4th (capiam, audiam). Notice that the 1st conjugation swaps its ā for e, while every other conjugation brings in an a.',
        },
        {
          kind: 'p',
          text: 'The vowel is long in most forms (amēs, regāmus) but short before a final -m or -t and before -nt (amem, amet, ament). Verbs like capiō, capere work exactly like audiō: capiam, capiās, capiat, capiāmus, capiātis, capiant.',
        },
        {
          kind: 'p',
          text: '*esse* and *posse* are irregular and must be memorised. They use the vowel i.',
        },
        {
          kind: 'table',
          caption: 'Present subjunctive of esse and posse',
          head: ['Person', 'esse', 'posse'],
          rows: [
            ['1st sg.', 'sim', 'possim'],
            ['2nd sg.', 'sīs', 'possīs'],
            ['3rd sg.', 'sit', 'possit'],
            ['1st pl.', 'sīmus', 'possīmus'],
            ['2nd pl.', 'sītis', 'possītis'],
            ['3rd pl.', 'sint', 'possint'],
          ],
        },
      ],
    },
    {
      heading: 'Present Passive Subjunctive',
      blocks: [
        {
          kind: 'p',
          text: 'Keep the same vowel and swap in the passive endings **-r, -ris, -tur, -mur, -minī, -ntur**. If you can say amem, you can say amer.',
        },
        {
          kind: 'table',
          caption: 'Present passive subjunctive',
          head: ['Person', 'amō (1st)', 'moneō (2nd)', 'regō (3rd)', 'audiō (4th)'],
          rows: [
            ['1st sg.', 'amer', 'monear', 'regar', 'audiar'],
            ['2nd sg.', 'amēris', 'moneāris', 'regāris', 'audiāris'],
            ['3rd sg.', 'amētur', 'moneātur', 'regātur', 'audiātur'],
            ['1st pl.', 'amēmur', 'moneāmur', 'regāmur', 'audiāmur'],
            ['2nd pl.', 'amēminī', 'moneāminī', 'regāminī', 'audiāminī'],
            ['3rd pl.', 'amentur', 'moneantur', 'regantur', 'audiantur'],
          ],
        },
        {
          kind: 'p',
          text: 'The vowel is short before the final -r and before -ntur (amer, amentur). Deponent verbs use these same passive forms with an active meaning: loquor gives loquar, loquāris, loquātur.',
        },
      ],
    },
    {
      heading: 'Imperfect Active and Imperfect Passive Subjunctive',
      blocks: [
        {
          kind: 'p',
          text: 'This is the easiest tense. Take the **present active infinitive** (the second principal part) and add the endings straight onto it: active -m, -s, -t, -mus, -tis, -nt, or passive -r, -ris, -tur, -mur, -minī, -ntur. The final e of the infinitive becomes long except before -m, -t, -nt and a final -r.',
        },
        {
          kind: 'table',
          caption: 'Imperfect subjunctive of amō (infinitive amāre)',
          head: ['Person', 'Active', 'Passive'],
          rows: [
            ['1st sg.', 'amārem', 'amārer'],
            ['2nd sg.', 'amārēs', 'amārēris'],
            ['3rd sg.', 'amāret', 'amārētur'],
            ['1st pl.', 'amārēmus', 'amārēmur'],
            ['2nd pl.', 'amārētis', 'amārēminī'],
            ['3rd pl.', 'amārent', 'amārentur'],
          ],
        },
        {
          kind: 'table',
          caption: 'The rule works for every conjugation, and even for esse and posse',
          head: ['Infinitive', 'Imperfect subjunctive, 1st sg.'],
          rows: [
            ['amāre', 'amārem'],
            ['monēre', 'monērem'],
            ['regere', 'regerem'],
            ['capere', 'caperem'],
            ['audīre', 'audīrem'],
            ['esse', 'essem'],
            ['posse', 'possem'],
          ],
        },
        {
          kind: 'tip',
          title: 'Use the real infinitive',
          text: 'capiō has the infinitive **capere**, so its imperfect subjunctive is **caperem**, not "capirem". Always build from the infinitive itself, never from the first principal part.',
        },
      ],
    },
    {
      heading: 'Perfect Active and Perfect Passive Subjunctive',
      blocks: [
        {
          kind: 'p',
          text: '**Active:** take the perfect stem (the third principal part without its -ī: amāvī gives amāv-) and add **-erim, -erīs, -erit, -erīmus, -erītis, -erint**. So dūcō gives dūxerim, moneō gives monuerim, audiō gives audīverim, capiō gives cēperim.',
        },
        {
          kind: 'p',
          text: '**Passive:** take the perfect passive participle (from the fourth principal part: amātum gives amātus) and add the **present subjunctive of esse**: sim, sīs, sit, sīmus, sītis, sint. The participle agrees with the subject, so it can be amātus, amāta or amātum in the singular and amātī, amātae or amāta in the plural.',
        },
        {
          kind: 'table',
          caption: 'Perfect subjunctive of amō',
          head: ['Person', 'Active', 'Passive'],
          rows: [
            ['1st sg.', 'amāverim', 'amātus sim'],
            ['2nd sg.', 'amāverīs', 'amātus sīs'],
            ['3rd sg.', 'amāverit', 'amātus sit'],
            ['1st pl.', 'amāverīmus', 'amātī sīmus'],
            ['2nd pl.', 'amāverītis', 'amātī sītis'],
            ['3rd pl.', 'amāverint', 'amātī sint'],
          ],
        },
      ],
    },
    {
      heading: 'Pluperfect Active and Pluperfect Passive Subjunctive',
      blocks: [
        {
          kind: 'p',
          text: '**Active:** perfect stem + **-issem, -issēs, -isset, -issēmus, -issētis, -issent**. A handy shortcut: it looks like the perfect active infinitive (amāvisse) with the endings added.',
        },
        {
          kind: 'p',
          text: '**Passive:** perfect passive participle + the **imperfect subjunctive of esse**: essem, essēs, esset, essēmus, essētis, essent.',
        },
        {
          kind: 'table',
          caption: 'Pluperfect subjunctive of amō',
          head: ['Person', 'Active', 'Passive'],
          rows: [
            ['1st sg.', 'amāvissem', 'amātus essem'],
            ['2nd sg.', 'amāvissēs', 'amātus essēs'],
            ['3rd sg.', 'amāvisset', 'amātus esset'],
            ['1st pl.', 'amāvissēmus', 'amātī essēmus'],
            ['2nd pl.', 'amāvissētis', 'amātī essētis'],
            ['3rd pl.', 'amāvissent', 'amātī essent'],
          ],
        },
        {
          kind: 'tip',
          title: 'Two-word passives',
          text: 'In a two-word passive, the little form of esse decides the tense. **amātus sit** (present subjunctive sit) is perfect passive subjunctive. **amātus esset** (imperfect subjunctive esset) is pluperfect passive subjunctive. Do not call amātus esset "imperfect" just because esset is imperfect.',
        },
      ],
    },
    {
      heading: 'Indicative vs. Subjunctive recognition',
      blocks: [
        {
          kind: 'p',
          text: 'To spot a subjunctive, look at what sits between the stem and the ending. Each tense has its own signal.',
        },
        {
          kind: 'table',
          head: ['Tense', 'Signal', 'Subjunctive', 'Indicative look-alike'],
          rows: [
            ['Present', 'vowel change (e, ea, a, ia)', 'amet, regat', 'amat, regit'],
            ['Imperfect', 'whole infinitive + ending', 'amāret', 'amābat'],
            ['Perfect', 'perfect stem + -eri-', 'amāverim', 'amāvī, amāverō'],
            ['Pluperfect', 'perfect stem + -isse-', 'amāvisset', 'amāverat'],
            ['Perfect passive', 'participle + sim, sit...', 'amātus sit', 'amātus est'],
            ['Pluperfect passive', 'participle + essem, esset...', 'amātus esset', 'amātus erat'],
          ],
        },
        {
          kind: 'p',
          text: '**-ba-** (or -bā-) right before the personal ending marks the imperfect indicative (amābat, regēbat, audiēbātur). If the infinitive is sitting inside the verb instead (amāret, regeret), it is the imperfect subjunctive.',
        },
        {
          kind: 'tip',
          title: 'Three look-alikes to watch',
          text: 'In the 3rd conjugation, **a** marks the present subjunctive and **e** marks the future: dūcāmur is subjunctive, dūcēmur is future. But the first person singular is the same in both (regam, capiam, audiam can be either), so let the sentence decide. Finally, apart from the long ī in some forms (dūxerīs vs dūxeris), the perfect subjunctive and the future perfect indicative are spelled the same except in the first person singular (dūxerim vs dūxerō). A form in -erim can only be perfect subjunctive. On its own, dūxerint could be either; the sentence decides.',
        },
      ],
    },
  ],
  check: ['f003', 'f040', 'f044', 'f051', 'f062'],
};
