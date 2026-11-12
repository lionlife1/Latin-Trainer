import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'gerund_gerundive',
  title: 'Gerund and Gerundive',
  summary:
    'The gerund is a verbal noun ("of doing", "by doing"); the gerundive is a verbal adjective ("to be done"). Both have -nd- in the stem. Together they express purpose, and the gerundive with sum expresses obligation.',
  sections: [
    {
      heading: 'Gerund: a Verbal Noun',
      blocks: [
        {
          kind: 'p',
          text: 'The **gerund** is a noun made from a verb, like English "reading" in "the art of reading". It is a **neuter singular** noun of the 2nd declension, formed from the present stem + **-nd-**: -andī in the 1st conjugation, -endī in the 2nd and 3rd, -iendī in 3rd -iō and 4th. It is active in meaning, and deponents form it in the same way (hortandī, "of encouraging"; loquendī, "of speaking").',
        },
        {
          kind: 'table',
          caption: 'The gerund',
          head: ['Case', 'laudō', 'dūcō', 'capiō', 'audiō'],
          rows: [
            ['Nominative', 'none: use laudāre', 'none: use dūcere', 'none: use capere', 'none: use audīre'],
            ['Genitive', 'laudandī', 'dūcendī', 'capiendī', 'audiendī'],
            ['Dative', 'laudandō', 'dūcendō', 'capiendō', 'audiendō'],
            ['Accusative', '(ad) laudandum', '(ad) dūcendum', '(ad) capiendum', '(ad) audiendum'],
            ['Ablative', 'laudandō', 'dūcendō', 'capiendō', 'audiendō'],
          ],
        },
        {
          kind: 'p',
          text: 'The gerund has **no nominative**. When a verbal noun is the subject, Latin uses the **infinitive**: *Nāvigāre perīculōsum est*, "Sailing is dangerous." The accusative gerund is used mostly after a preposition such as **ad**. The genitive goes with nouns and with adjectives like cupidus and perītus; the dative is rare; the ablative usually shows **means**.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Iuvenis **pugnandī** cupidus erat.', en: 'The young man was eager to fight (eager for fighting).' },
            { la: 'Haec silva **vēnandō** apta est.', en: 'This wood is suitable for hunting.', note: 'Dative.' },
            { la: 'Puerī in campum ad **lūdendum** cucurrērunt.', en: 'The boys ran onto the field to play.' },
            { la: 'Fabrī **labōrandō** dīvitēs factī sunt.', en: 'The craftsmen became rich by working.', note: 'Ablative of means.' },
          ],
        },
      ],
    },
    {
      heading: 'Gerundive: a Verbal Adjective',
      blocks: [
        {
          kind: 'p',
          text: 'The **gerundive** has the same -nd- stem, but it is an **adjective**: -ndus, -nda, -ndum, declined like bonus. It **agrees with a noun**, and it is **passive**: it means "to be ...ed", often with the idea of something that ought to be done.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Hic est vir **laudandus**.', en: 'This is a man to be praised (a man who deserves praise).' },
            {
              la: 'Caesar pontem in flūmine **faciendum** cūrāvit.',
              en: 'Caesar had a bridge built over the river.',
              note: 'Literally "saw to a bridge to be built".',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Do not confuse the -nd- forms with the **present participle**, which has **-nt-** (laudantem, "praising"). A gerund never agrees with anything; a gerundive always does.',
        },
      ],
    },
    {
      heading: 'Gerundive in Place of Gerund + Object',
      blocks: [
        {
          kind: 'p',
          text: 'A gerund can in theory take a direct object (urbem videndī, "of seeing the city"), but Latin usually prefers the **gerundive construction**. Put the noun into the case the gerund would have had, and make the gerundive **agree** with it. After a preposition such as ad, the gerundive is the regular choice and the gerund + object is avoided.',
        },
        {
          kind: 'table',
          head: ['Case', 'Gerund + object', 'Gerundive construction', 'English'],
          rows: [
            ['Genitive', 'urbem videndī', 'urbis videndae', 'of seeing the city'],
            ['Accusative (ad)', 'ad nāvēs reficiendum (avoided)', 'ad nāvēs reficiendās', 'to repair the ships'],
            ['Ablative', 'librōs legendō', 'librīs legendīs', 'by reading books'],
          ],
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Mīlitēs ad **nāvēs reficiendās** missī sunt.',
              en: 'The soldiers were sent to repair the ships.',
              note: 'reficiendās agrees with nāvēs: feminine accusative plural.',
            },
            { la: 'Ingenium **librīs legendīs** alitur.', en: 'The mind is nourished by reading books.' },
          ],
        },
        {
          kind: 'p',
          text: 'English translates the gerundive construction exactly like the gerund: "of seeing the city", not "of the city to be seen".',
        },
      ],
    },
    {
      heading: 'Purpose: ad + Gerund or Gerundive; causā or grātiā + Genitive',
      blocks: [
        {
          kind: 'p',
          text: 'Classical prose does not use a plain infinitive to show purpose. Besides an ut clause, it can use **ad** + accusative gerund or gerundive, or a genitive gerund or gerundive + **causā** or **grātiā**, "for the sake of". causā and grātiā come **after** the genitive. All of these are usually translated "to ..." or "in order to ...".',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Senātōrēs ad **rem pūblicam dēfendendam** convēnērunt.',
              en: 'The senators gathered to defend the state.',
            },
            { la: 'Multī Rōmam **discendī causā** veniunt.', en: 'Many people come to Rome to learn.' },
            {
              la: 'Caesar equitēs **locī cognōscendī causā** praemīsit.',
              en: 'Caesar sent the cavalry ahead to explore the area.',
            },
            {
              la: 'Mercātōrēs **pecūniae faciendae grātiā** nāvigābant.',
              en: 'The merchants sailed to make money.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Passive Periphrastic (Obligation) and the Dative of Agent',
      blocks: [
        {
          kind: 'p',
          text: 'The gerundive + a form of **sum** is the **passive periphrastic**. It means "**must be ...ed**", "has to be ...ed". The tense of sum sets the time: est, "must"; erat, "had to"; erit, "will have to". The gerundive agrees with the subject.',
        },
        {
          kind: 'p',
          text: 'The person who must do the action is in the **dative**, not ā/ab + ablative. This is the **dative of agent**. English often sounds better with an active verb: "by us must be done" becomes "we must do".',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Hic mūrus **reficiendus est**.', en: 'This wall must be repaired.' },
            {
              la: '**Puerīs** librī **legendī erant**.',
              en: 'The books had to be read by the boys. (The boys had to read the books.)',
            },
            {
              la: '**Tibi** haec rēs **cōnsīderanda erit**.',
              en: 'This matter will have to be considered by you. (You will have to consider this matter.)',
            },
          ],
        },
      ],
    },
    {
      heading: 'Impersonal Passive Periphrastic',
      blocks: [
        {
          kind: 'p',
          text: 'A verb with **no direct object** (currō, pugnō, veniō) cannot have a personal passive subject. Latin then uses the **neuter singular** gerundive -ndum with est, erat or erit and no subject: "it must be fought" means "one must fight". Add a dative of agent to say who must do it.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Nōbīs mox **discēdendum est**.', en: 'We must leave soon.' },
            {
              la: 'Mīlitibus tōtam noctem **vigilandum erit**.',
              en: 'The soldiers will have to stay awake all night.',
            },
          ],
        },
        {
          kind: 'tip',
          title: 'Dative of agent only with gerundive + sum',
          text: 'With an ordinary passive verb the doer is **ā/ab + ablative**: *Urbs ā Gallīs capta est*, "The city was captured by the Gauls." The **dative** of agent goes with the **passive periphrastic**: *Urbs nōbīs dēfendenda est*, "The city must be defended by us." And a gerundive means "**to be** ...ed", never "being ...ed": *vir laudandus*, "a man to be praised".',
        },
      ],
    },
  ],
  check: ['m12-202', 'm12-304', 'm12-402', 'm12-406', 'm12-601'],
};
