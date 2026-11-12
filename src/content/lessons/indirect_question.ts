import type { Lesson } from './types';

export const lesson: Lesson = {
  moduleId: 'indirect_question',
  title: 'Indirect Question',
  summary:
    'A question reported after a verb of asking, knowing or telling becomes an indirect question. It keeps its question word, puts its verb in the subjunctive, and follows the sequence of tenses strictly.',
  sections: [
    {
      heading: 'From direct to indirect',
      blocks: [
        {
          kind: 'p',
          text: 'A direct question is asked out loud: "Who came?" An **indirect question** reports a question inside another sentence: "I ask **who came**", "I don\'t know **who came**". In Latin the reported question keeps its **question word**, and its verb becomes **subjunctive**.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Quis vēnit?', en: 'Who came?', note: 'Direct question: indicative.' },
            { la: 'Rogō **quis vēnerit**.', en: 'I ask who came.', note: 'Indirect question: subjunctive.' },
          ],
        },
        {
          kind: 'p',
          text: 'The main verb is a verb of **asking, knowing, telling, wondering, seeing or finding out**: rogō, quaerō, sciō, nesciō, intellegō, mīror, cognōscō, videō, and the command dīc mihi ("tell me"). Translate the subjunctive as a plain English verb: "who came", not "who might come".',
        },
      ],
    },
    {
      heading: 'Interrogatives: the question words',
      blocks: [
        {
          kind: 'p',
          text: 'An indirect question always begins with a **question word**. Learn these well, because they are the signal that tells you what kind of clause you are reading.',
        },
        {
          kind: 'table',
          head: ['Latin', 'Meaning'],
          rows: [
            ['quis, quid', 'who, what'],
            ['quī, quae, quod', 'which, what (with a noun)'],
            ['cūr', 'why'],
            ['ubi', 'where (at what place)'],
            ['quō', 'where to (to what place)'],
            ['unde', 'where from (from what place)'],
            ['quandō', 'when'],
            ['quōmodo', 'how, in what way'],
            ['quantus, -a, -um', 'how great, how large'],
            ['quālis, -e', 'what kind of'],
            ['quot', 'how many (does not decline)'],
            ['num, -ne', 'whether'],
            ['utrum ... an', 'whether ... or'],
            ['utrum ... necne', 'whether ... or not'],
          ],
        },
        {
          kind: 'p',
          text: 'Notice that **ubi**, **quō** and **unde** are not interchangeable. Latin separates being at a place (ubi), moving to it (quō) and moving away from it (unde).',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Nesciō **ubi** frāter meus **habitet**.', en: 'I do not know where my brother lives.' },
            { la: 'Rogāvit **num** fessī **essēmus**.', en: 'He asked whether we were tired.' },
            {
              la: 'Dīc mihi **utrum** Rōmam **eās an** domī **maneās**.',
              en: 'Tell me whether you are going to Rome or staying at home.',
            },
            {
              la: 'Nūntius nōn dīxit **quot** hostēs **adessent**.',
              en: 'The messenger did not say how many enemies were present.',
            },
          ],
        },
        {
          kind: 'tip',
          title: 'num means "whether"',
          text: 'In a direct question, num expects the answer "no" ("Surely ... not?"). In an indirect question it loses that meaning and simply means **"whether"**: *Rogāvit num fessī essēmus*, "He asked whether we were tired."',
        },
      ],
    },
    {
      heading: 'Indirect question or relative clause?',
      blocks: [
        {
          kind: 'p',
          text: 'Question words and relative pronouns can look alike (quis, quī, quod). A **relative clause** describes a noun in the main clause (its antecedent) and usually has an **indicative** verb. An **indirect question** has no antecedent: it is the object of a verb of asking or knowing, and its verb is **subjunctive**.',
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Cīvem vīdī **quī** epistulam **portābat**.',
              en: 'I saw the citizen who was carrying the letter.',
              note: 'quī refers back to cīvem; indicative: relative clause.',
            },
            {
              la: 'Rogāvī **quis** epistulam **portāret**.',
              en: 'I asked who was carrying the letter.',
              note: 'No antecedent, verb of asking, subjunctive: indirect question.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Watch rogō in particular. With **ut** or **nē** it introduces an indirect command ("ask someone to do something"). With a question word it introduces an indirect question ("ask who, why, whether").',
        },
      ],
    },
    {
      heading: 'SOT Alignment: choosing the tense',
      blocks: [
        {
          kind: 'p',
          text: 'Indirect questions follow the sequence of tenses strictly, and unlike purpose clauses they use **all four** subjunctive tenses, because a question can ask about something going on now or something that already happened. First find the sequence from the main verb, then ask whether the action in the question is at the **same time** as the main verb or **before** it.',
        },
        {
          kind: 'table',
          caption: 'legō in an indirect question, "what you ..."',
          head: ['Sequence', 'Same time', 'Time before'],
          rows: [
            ['Primary: Rogat quid ...', 'legās: "what you are reading"', 'lēgerīs: "what you read / have read"'],
            ['Secondary: Rogāvit quid ...', 'legerēs: "what you were reading"', 'lēgissēs: "what you had read"'],
          ],
        },
        {
          kind: 'examples',
          items: [
            {
              la: 'Intellegō cūr puellae **rīdeant**.',
              en: 'I understand why the girls are laughing.',
              note: 'Primary, same time: present subjunctive.',
            },
            {
              la: 'Nescīmus quō hostēs **fūgerint**.',
              en: 'We do not know where the enemy fled to.',
              note: 'Primary, time before: perfect subjunctive.',
            },
            {
              la: 'Cognōvit unde nāvēs **vēnissent**.',
              en: 'He found out where the ships had come from.',
              note: 'Secondary, time before: pluperfect subjunctive.',
            },
            {
              la: 'Quaerēbant quis mūrum **dēlēvisset**.',
              en: 'They were asking who had destroyed the wall.',
            },
          ],
        },
        {
          kind: 'tip',
          title: 'Present or perfect?',
          text: 'After a primary main verb, the present subjunctive means "is doing" and the perfect subjunctive means "did" or "has done". *Rogat quid legās* is "He asks what you are reading"; *Rogat quid lēgerīs* is "He asks what you read". Do not translate the perfect subjunctive as a present.',
        },
      ],
    },
    {
      heading: 'Questions about the future',
      blocks: [
        {
          kind: 'p',
          text: 'The subjunctive has no future tense. When an indirect question looks ahead, Latin uses the future active participle (-ūrus) with **sim** in primary sequence or **essem** in secondary sequence.',
        },
        {
          kind: 'examples',
          items: [
            { la: 'Nesciō quid **factūrus sīs**.', en: 'I do not know what you will do.' },
            { la: 'Rogāvērunt quandō **reditūrī essēmus**.', en: 'They asked when we would return.' },
          ],
        },
      ],
    },
  ],
  check: ['m5-103', 'm5-203', 'm5-303', 'm5-404', 'm5-603'],
};
