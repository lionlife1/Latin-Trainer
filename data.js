// data.js - Offline Database

const APP_MODULES = [
  {
    "id": "forms_bootcamp",
    "badge": "M0",
    "title": "Forms Bootcamp",
    "tagline": "Conjugate all four subjunctive tenses, active & passive",
    "prerequisites": [],
    "xp_reward": 120
  },
  {
    "id": "sequence_of_tenses",
    "badge": "M1",
    "title": "Sequence of Tenses",
    "tagline": "Primary vs. Secondary — the grammar backbone",
    "prerequisites": [], // UNLOCKED
    "xp_reward": 100
  },
  {
    "id": "independent_uses",
    "badge": "M2",
    "title": "Independent Subjunctive",
    "tagline": "Hortatory, Jussive, Optative, Deliberative",
    "prerequisites": [], // UNLOCKED
    "xp_reward": 100
  },
  {
    "id": "purpose_result_indirect",
    "badge": "M3",
    "title": "Purpose · Result · Indirect Command",
    "tagline": "ut/nē discrimination drills",
    "prerequisites": [], // UNLOCKED
    "xp_reward": 110
  },
  {
    "id": "cum_clauses",
    "badge": "M4",
    "title": "Cum Clauses",
    "tagline": "Circumstantial, Causal, Concessive, Inversum",
    "prerequisites": [], // UNLOCKED
    "xp_reward": 100
  },
  {
    "id": "indirect_question",
    "badge": "M5",
    "title": "Indirect Question",
    "tagline": "Interrogative words + subjunctive in reported speech",
    "prerequisites": [], // UNLOCKED
    "xp_reward": 90
  },
  {
    "id": "fear_clauses",
    "badge": "M6",
    "title": "Fear Clauses",
    "tagline": "timēre/verērī + nē / ut",
    "prerequisites": [], // UNLOCKED
    "xp_reward": 80
  },
  {
    "id": "conditionals",
    "badge": "M7",
    "title": "Conditionals",
    "tagline": "All six types — Simple to Contrary-to-Fact",
    "prerequisites": [], // UNLOCKED
    "xp_reward": 120
  },
  {
    "id": "quin_clauses",
    "badge": "M8",
    "title": "Quin Clauses",
    "tagline": "Doubting and preventing with quin",
    "prerequisites": [], // UNLOCKED
    "xp_reward": 90
  },
  {
    "id": "relative_subjunctive",
    "badge": "M9",
    "title": "Relative Clause Subjunctive",
    "tagline": "Purpose, Result, Characteristic relative clauses",
    "prerequisites": [], // UNLOCKED
    "xp_reward": 100
  }
];

const MODULE_DB = {
  "forms_bootcamp": {
    "id": "forms_bootcamp",
    "title": "Forms Bootcamp",
    "badge": "M0",
    "tagline": "Present, Imperfect, Perfect, Pluperfect — Active & Passive",
    "description": "Master all four subjunctive tenses in active and passive voice. You'll conjugate every form from scratch and learn to distinguish subjunctive from indicative on sight. This is the foundation for every other module.",
    "prerequisites": [],
    "xp_reward": 120,
    "concepts": [
      "Present Active Subjunctive", "Present Passive Subjunctive",
      "Imperfect Active Subjunctive", "Imperfect Passive Subjunctive",
      "Perfect Active Subjunctive", "Perfect Passive Subjunctive",
      "Pluperfect Active Subjunctive", "Pluperfect Passive Subjunctive",
      "Indicative vs. Subjunctive recognition"
    ],
    "questions": [
      {
        "id": "f001",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>1st person singular present active subjunctive</strong> of <span class='latin-word'>amare</span> (to love).",
        "hint": "Present active subjunctive: change the characteristic vowel. 1st conj. ā → e.",
        "answers": ["amem"],
        "explanation": "The present active subjunctive of 1st conjugation verbs replaces the characteristic -ā- with -ē-: amō → amem, ames, amet..."
      },
      {
        "id": "f002",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person plural present active subjunctive</strong> of <span class='latin-word'>monere</span> (to warn).",
        "hint": "Present active subjunctive: 2nd conj. ē → eā. 3pl ending = -nt.",
        "answers": ["moneant"],
        "explanation": "2nd conjugation: characteristic -ē- shifts → eā-. 3pl: moneant."
      },
      {
        "id": "f003",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>2nd person singular present active subjunctive</strong> of <span class='latin-word'>ducere</span> (to lead).",
        "hint": "3rd conjugation: add -ā- between stem and ending. 2sg = -s.",
        "answers": ["ducas"],
        "explanation": "3rd conjugation present subjunctive: dūc- + ā + s = dūcās."
      },
      {
        "id": "f004",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>1st person plural present active subjunctive</strong> of <span class='latin-word'>audire</span> (to hear).",
        "hint": "4th conjugation: add -ā- after the stem vowel. 1pl = -mus.",
        "answers": ["audiamus"],
        "explanation": "4th conjugation: aud- + iā + mus = audiāmus."
      },
      {
        "id": "f005",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person singular present active subjunctive</strong> of <span class='latin-word'>esse</span> (to be).",
        "hint": "esse is irregular in the present subjunctive: sim, sis, sit...",
        "answers": ["sit"],
        "explanation": "esse: sim, sīs, sit, sīmus, sītis, sint. Memorize these — they appear constantly."
      },
      {
        "id": "f006",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person plural present active subjunctive</strong> of <span class='latin-word'>esse</span>.",
        "hint": "The 3pl of esse's present subjunctive is irregular.",
        "answers": ["sint"],
        "explanation": "sint (not 'seant' — esse is fully irregular in the present subjunctive)."
      },
      {
        "id": "f007",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>2nd person plural present passive subjunctive</strong> of <span class='latin-word'>amare</span>.",
        "hint": "Build the present active subjunctive base (amē-), then swap active endings for passive.",
        "answers": ["amemini"],
        "explanation": "amēminī — 2pl passive ending -minī is added to the present subjunctive stem amē-."
      },
      {
        "id": "f008",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person singular present passive subjunctive</strong> of <span class='latin-word'>ducere</span>.",
        "hint": "3rd conj. present subjunctive stem is dūcā-. 3sg passive = -tur.",
        "answers": ["ducatur"],
        "explanation": "dūcātur. 3sg passive ending -tur applied to dūcā- stem."
      },
      {
        "id": "f010",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>1st person singular imperfect active subjunctive</strong> of <span class='latin-word'>amare</span>.",
        "hint": "Imperfect active subjunctive = present active infinitive + personal endings. 1sg = -m.",
        "answers": ["amarem"],
        "explanation": "Rule: take the present active infinitive (amāre) and add -m, -s, -t, -mus, -tis, -nt. → amārem."
      },
      {
        "id": "f011",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person plural imperfect active subjunctive</strong> of <span class='latin-word'>monere</span>.",
        "hint": "Infinitive = monēre. Add -nt for 3pl.",
        "answers": ["monerent"],
        "explanation": "monēre + nt → monērent."
      },
      {
        "id": "f012",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>2nd person singular imperfect active subjunctive</strong> of <span class='latin-word'>ducere</span>.",
        "hint": "Infinitive of dūcō is dūcere. 2sg = -s.",
        "answers": ["duceres"],
        "explanation": "dūcere + s → dūcerēs."
      },
      {
        "id": "f013",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>1st person plural imperfect active subjunctive</strong> of <span class='latin-word'>esse</span>.",
        "hint": "Infinitive of esse = esse. 1pl = -mus.",
        "answers": ["essemus"],
        "explanation": "esse + mus → essēmus."
      },
      {
        "id": "f014",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person singular imperfect passive subjunctive</strong> of <span class='latin-word'>amare</span>.",
        "hint": "Imperfect passive subjunctive: use the infinitive stem + passive ending. 3sg passive = -tur.",
        "answers": ["amaretur"],
        "explanation": "amāre- + tur = amārētur. Imperfect passive: infinitive + passive personal endings."
      },
      {
        "id": "f015",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person plural imperfect passive subjunctive</strong> of <span class='latin-word'>monere</span>.",
        "hint": "monēre + passive 3pl ending -ntur.",
        "answers": ["monerentur"],
        "explanation": "monēre + ntur → monērentur."
      },
      {
        "id": "f020",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>1st person singular perfect active subjunctive</strong> of <span class='latin-word'>amare</span>. (Perf. stem: amāv-)",
        "hint": "Perfect active subjunctive: perfect stem + -erim, -eris, -erit...",
        "answers": ["amaverim"],
        "explanation": "Perfect active subjunctive = perfect stem + -erim/-erīs/-erit/-erīmus/-erītis/-erint. amāv + erim = amāverim."
      },
      {
        "id": "f021",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person plural perfect active subjunctive</strong> of <span class='latin-word'>amare</span>. (Perf. stem: amāv-)",
        "hint": "Perfect active subjunctive 3pl ending = -erint.",
        "answers": ["amaverint"],
        "explanation": "amāv + erint = amāverint."
      },
      {
        "id": "f022",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>2nd person singular perfect active subjunctive</strong> of <span class='latin-word'>ducere</span>. (Perf. stem: dūx-)",
        "hint": "Perfect active subjunctive 2sg = -eris.",
        "answers": ["duxeris"],
        "explanation": "dūx + eris = dūxeris."
      },
      {
        "id": "f023",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "The perfect passive subjunctive is formed with the <strong>perfect passive participle</strong> + what?",
        "hint": "Think: which subjunctive form of esse do you combine it with?",
        "answers": ["sim", "sis", "sit", "simus", "sitis", "sint", "present subjunctive of esse", "present subjunctive"],
        "explanation": "Perfect passive subjunctive = PPP + present subjunctive of esse (sim/sīs/sit...). E.g., amātus sim = 'I may have been loved.'"
      },
      {
        "id": "f024",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person singular perfect passive subjunctive</strong> of <span class='latin-word'>amare</span>. (PPP: amātus)",
        "hint": "PPP (singular, agrees with subject) + 3sg present subjunctive of esse.",
        "answers": ["amatus sit"],
        "explanation": "amātus sit (masc. sg.) — PPP + sit. Gender of PPP must agree with subject in actual use."
      },
      {
        "id": "f030",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>1st person singular pluperfect active subjunctive</strong> of <span class='latin-word'>amare</span>. (Perf. stem: amāv-)",
        "hint": "Pluperfect active subjunctive: perfect stem + -issem, -issēs, -isset...",
        "answers": ["amavissem"],
        "explanation": "Pluperfect active subjunctive = perfect stem + -issem/-issēs/-isset/-issēmus/-issētis/-issent. amāv + issem = amāvissem."
      },
      {
        "id": "f031",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person plural pluperfect active subjunctive</strong> of <span class='latin-word'>ducere</span>. (Perf. stem: dūx-)",
        "hint": "Pluperfect active subjunctive 3pl = -issent.",
        "answers": ["duxissent"],
        "explanation": "dūx + issent = dūxissent."
      },
      {
        "id": "f032",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>2nd person singular pluperfect active subjunctive</strong> of <span class='latin-word'>monere</span>. (Perf. stem: monu-)",
        "hint": "Pluperfect active subjunctive 2sg = -issēs.",
        "answers": ["monuisses"],
        "explanation": "monu + issēs = monuissēs."
      },
      {
        "id": "f033",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "The pluperfect passive subjunctive is formed with the <strong>perfect passive participle</strong> + what?",
        "hint": "Same logic as perfect passive subjunctive, but use which tense of esse?",
        "answers": ["essem", "esses", "esset", "essemus", "essetis", "essent", "imperfect subjunctive of esse", "imperfect subjunctive"],
        "explanation": "Pluperfect passive subjunctive = PPP + imperfect subjunctive of esse (essem/essēs/esset...). E.g., amātus essem = 'I had been loved (subj.)'"
      },
      {
        "id": "f034",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person singular pluperfect passive subjunctive</strong> of <span class='latin-word'>amare</span>. (PPP: amātus)",
        "hint": "PPP + 3sg imperfect subjunctive of esse.",
        "answers": ["amatus esset"],
        "explanation": "amātus esset — PPP + esset."
      },
      {
        "id": "f035",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>1st person plural pluperfect active subjunctive</strong> of <span class='latin-word'>audire</span>. (Perf. stem: audīv-)",
        "hint": "Pluperfect active subjunctive 1pl = -issēmus.",
        "answers": ["audivissemus"],
        "explanation": "audīv + issēmus = audīvissēmus."
      },
      {
        "id": "f040",
        "type": "mc",
        "badge": "IDENTIFY",
        "prompt": "Identify the tense and mood of: <span class='latin-word'>amāret</span>",
        "hint": "Look at the ending and the infinitive stem pattern.",
        "correct": "Imperfect active subjunctive",
        "choices": [
          "Present active subjunctive",
          "Imperfect active subjunctive",
          "Imperfect active indicative",
          "Perfect active subjunctive"
        ],
        "explanation": "amāret = infinitive amāre + t (3sg). This is imperfect active subjunctive. Compare indicative amābat — the -ba- infix is the giveaway for indicative."
      },
      {
        "id": "f041",
        "type": "mc",
        "badge": "IDENTIFY",
        "prompt": "Identify the tense and mood of: <span class='latin-word'>dūxerint</span>",
        "hint": "The -eri- infix is characteristic of one subjunctive tense.",
        "correct": "Perfect active subjunctive",
        "choices": [
          "Pluperfect active subjunctive",
          "Future perfect indicative",
          "Perfect active subjunctive",
          "Perfect active indicative"
        ],
        "explanation": "dūx (perfect stem) + erint = perfect active subjunctive 3pl. Future perfect would be dūxerint too — in practice, context decides. On a form-ID question, 'perfect active subjunctive' is the expected answer."
      },
      {
        "id": "f042",
        "type": "mc",
        "badge": "IDENTIFY",
        "prompt": "Identify the tense and mood of: <span class='latin-word'>monuissētis</span>",
        "hint": "-issē- is the tell-tale infix for one tense.",
        "correct": "Pluperfect active subjunctive",
        "choices": [
          "Perfect active subjunctive",
          "Pluperfect active indicative",
          "Pluperfect active subjunctive",
          "Imperfect active subjunctive"
        ],
        "explanation": "monu (perf. stem) + issētis = pluperfect active subjunctive 2pl."
      },
      {
        "id": "f043",
        "type": "mc",
        "badge": "IDENTIFY",
        "prompt": "Identify the tense and mood of: <span class='latin-word'>amēmus</span>",
        "hint": "The vowel change from -ā- in the stem is the hint.",
        "correct": "Present active subjunctive",
        "choices": [
          "Present active indicative",
          "Imperfect active subjunctive",
          "Present active subjunctive",
          "Future active indicative"
        ],
        "explanation": "amēmus: the characteristic vowel -ā- of 1st conj. shifts to -ē- in the present subjunctive. 1pl = -mus."
      },
      {
        "id": "f044",
        "type": "mc",
        "badge": "IDENTIFY",
        "prompt": "Identify the tense and mood of: <span class='latin-word'>amātus esset</span>",
        "hint": "This is a two-word periphrastic form.",
        "correct": "Pluperfect passive subjunctive",
        "choices": [
          "Perfect passive indicative",
          "Perfect passive subjunctive",
          "Pluperfect passive subjunctive",
          "Pluperfect passive indicative"
        ],
        "explanation": "amātus (PPP) + esset (imperfect subjunctive of esse) = pluperfect passive subjunctive. If it were esset → pluperfect; if sit → perfect passive subjunctive."
      },
      {
        "id": "f045",
        "type": "mc",
        "badge": "IDENTIFY",
        "prompt": "Identify the tense and mood of: <span class='latin-word'>amātus sit</span>",
        "hint": "PPP + which form of esse?",
        "correct": "Perfect passive subjunctive",
        "choices": [
          "Pluperfect passive subjunctive",
          "Perfect passive indicative",
          "Present passive subjunctive",
          "Perfect passive subjunctive"
        ],
        "explanation": "amātus (PPP) + sit (3sg present subjunctive of esse) = perfect passive subjunctive."
      },
      {
        "id": "f050",
        "type": "mc",
        "badge": "DISTINGUISH",
        "prompt": "Which form is <em>indicative</em>, not subjunctive?\n<br><br><span class='latin-word'>amāret / amābat / amāverim / amāverit</span>",
        "hint": "The indicative imperfect has a distinctive infix.",
        "correct": "amābat",
        "choices": [
          "amāret",
          "amābat",
          "amāverit",
          "amāverim"
        ],
        "explanation": "amābat = imperfect INDICATIVE (3sg). The -bā- infix always signals indicative imperfect. amāret is subjunctive, amāverit/amāverim are perfect subjunctive."
      },
      {
        "id": "f051",
        "type": "mc",
        "badge": "DISTINGUISH",
        "prompt": "Which form is <em>subjunctive</em>?\n<br><br><span class='latin-word'>dūcit / dūcat / dūcēbat / dūxerat</span>",
        "hint": "Look for the -ā- vowel inserted into the 3rd conjugation stem.",
        "correct": "dūcat",
        "choices": [
          "dūcit",
          "dūcēbat",
          "dūxerat",
          "dūcat"
        ],
        "explanation": "dūcat = present active subjunctive (3rd conj. takes -ā- in present subjunctive). dūcit = indicative pres., dūcēbat = indicative imperf., dūxerat = indicative pluperf."
      },
      {
        "id": "f052",
        "type": "mc",
        "badge": "DISTINGUISH",
        "prompt": "Which is the correct imperfect active subjunctive of <span class='latin-word'>esse</span>?",
        "hint": "Imperfect subjunctive = present infinitive + endings. What is esse's infinitive?",
        "correct": "esset",
        "choices": [
          "erat",
          "fuerit",
          "sit",
          "esset"
        ],
        "explanation": "esse + t = esset. erat = indicative imperfect (3sg). fuerit = perfect subjunctive. sit = present subjunctive."
      },
      {
        "id": "f060",
        "type": "typein",
        "badge": "PRINCIPAL PARTS",
        "prompt": "Complete the paradigm: The four <strong>principal parts</strong> of <span class='latin-word'>amare</span> are: amō, amāre, amāvī, _____",
        "hint": "The 4th principal part is the perfect passive participle (PPP).",
        "answers": ["amatum", "amatus"],
        "explanation": "amātum (supine/4PP) or amātus (PPP, masc. nom. sg.). The PPP amātus/a/um is built on this stem and is required to form passive perfect and pluperfect subjunctives."
      },
      {
        "id": "f061",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person singular present active subjunctive</strong> of <span class='latin-word'>capere</span> (3rd -io conj., perf. cēpī).",
        "hint": "3rd -iō verbs follow the 4th conjugation pattern in the present subjunctive.",
        "answers": ["capiat"],
        "explanation": "cap- + iā + t = capiat. 3rd -iō verbs (like 4th) insert -iā- in the present subjunctive."
      },
      {
        "id": "f062",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>1st person singular imperfect active subjunctive</strong> of <span class='latin-word'>capere</span>.",
        "hint": "Imperfect subjunctive = present active infinitive + endings. What is capere's infinitive?",
        "answers": ["caperem"],
        "explanation": "capere + m = caperem. Note: the infinitive is capere, NOT *capire."
      },
      {
        "id": "f063",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>3rd person plural present active subjunctive</strong> of <span class='latin-word'>posse</span> (to be able).",
        "hint": "posse is irregular. Its present subjunctive is: possim, possis, possit, possimus, possitis, _____",
        "answers": ["possint"],
        "explanation": "possint — 3pl present subjunctive of posse. Note the double -s- (pos + sim paradigm)."
      },
      {
        "id": "f064",
        "type": "typein",
        "badge": "CONJUGATE",
        "prompt": "Give the <strong>1st person singular imperfect active subjunctive</strong> of <span class='latin-word'>posse</span>.",
        "hint": "Infinitive of posse = posse. Apply the normal imperfect subjunctive rule.",
        "answers": ["possem"],
        "explanation": "posse + m = possem. Imperfect subjunctive of posse: possem, possēs, posset, possēmus, possētis, possent."
      },
      {
        "id": "f065",
        "type": "mc",
        "badge": "IDENTIFY",
        "prompt": "What tense and mood is <span class='latin-word'>portārentur</span>?",
        "hint": "The -re- + passive ending pattern signals which tense?",
        "correct": "Imperfect passive subjunctive",
        "choices": [
          "Present passive subjunctive",
          "Imperfect passive indicative",
          "Imperfect passive subjunctive",
          "Pluperfect passive subjunctive"
        ],
        "explanation": "portāre (infinitive) + ntur = portārentur. Imperfect passive subjunctive. The passive imperfect indicative would be portābantur."
      },
      {
        "id": "f066",
        "type": "mc",
        "badge": "IDENTIFY",
        "prompt": "What tense and mood is <span class='latin-word'>ducāmur</span>?",
        "hint": "The -ā- infix in a 3rd conjugation verb is telling.",
        "correct": "Present passive subjunctive",
        "choices": [
          "Future passive indicative",
          "Present passive subjunctive",
          "Imperfect passive subjunctive",
          "Present active subjunctive"
        ],
        "explanation": "dūcā + mur = present passive subjunctive 1pl. In 3rd conjugation, -ā- signals present subjunctive (compare future indicative dūcēmur with -ē-)."
      }
    ]
  },
  "sequence_of_tenses": {
    "id": "sequence_of_tenses",
    "title": "Sequence of Tenses",
    "badge": "M1",
    "description": "The master framework for all dependent subjunctives. Learn to align the main verb's sequence (Primary/Secondary) with the relative time of the subordinate clause.",
    "concepts": ["Primary Sequence", "Secondary Sequence", "Relative Time"],
    "questions": [
      // --- PART 1: MASTERING THE RULES ---
      {
        "id": "m1-101", "type": "mc", "badge": "SOT RULES",
        "prompt": "Which of the following is a <strong>Secondary (Historical)</strong> tense?",
        "hint": "Secondary tenses deal with past action.",
        "correct": "Imperfect",
        "choices": ["Present", "Future", "Imperfect", "Future Perfect"],
        "explanation": "Secondary tenses are Imperfect, Perfect, and Pluperfect. Primary tenses are Present, Future, and Future Perfect."
      },
      {
        "id": "m1-102", "type": "mc", "badge": "SOT RULES",
        "prompt": "Which of the following is a <strong>Primary</strong> tense?",
        "hint": "Primary tenses deal with present or future action.",
        "correct": "Future Perfect",
        "choices": ["Pluperfect", "Imperfect", "Perfect", "Future Perfect"],
        "explanation": "Primary tenses are Present, Future, and Future Perfect."
      },
      {
        "id": "m1-103", "type": "mc", "badge": "SOT RULES",
        "prompt": "In Primary Sequence, what subjunctive tense is used to show action happening at the <strong>SAME TIME</strong> as the main verb?",
        "hint": "Primary + Same Time = ?",
        "correct": "Present Subjunctive",
        "choices": ["Imperfect Subjunctive", "Perfect Subjunctive", "Present Subjunctive", "Pluperfect Subjunctive"],
        "explanation": "Primary sequence (Present/Fut main verb) uses the Present Subjunctive for simultaneous action."
      },
      {
        "id": "m1-104", "type": "mc", "badge": "SOT RULES",
        "prompt": "In Secondary Sequence, what subjunctive tense is used to show action that happened <strong>BEFORE</strong> the main verb?",
        "hint": "Secondary + Prior action = ?",
        "correct": "Pluperfect Subjunctive",
        "choices": ["Imperfect Subjunctive", "Perfect Subjunctive", "Present Subjunctive", "Pluperfect Subjunctive"],
        "explanation": "Secondary sequence (Past main verb) uses the Pluperfect Subjunctive to show an action had already happened."
      },
      {
        "id": "m1-105", "type": "mc", "badge": "SOT RULES",
        "prompt": "In Secondary Sequence, what subjunctive tense is used to show action happening at the <strong>SAME TIME</strong> as the main verb?",
        "hint": "Secondary + Same Time = ?",
        "correct": "Imperfect Subjunctive",
        "choices": ["Imperfect Subjunctive", "Perfect Subjunctive", "Present Subjunctive", "Pluperfect Subjunctive"],
        "explanation": "Secondary sequence uses the Imperfect Subjunctive for simultaneous (or subsequent) action."
      },
      {
        "id": "m1-106", "type": "mc", "badge": "SOT RULES",
        "prompt": "In Primary Sequence, what subjunctive tense is used to show action that happened <strong>BEFORE</strong> the main verb?",
        "hint": "Primary + Prior action = ?",
        "correct": "Perfect Subjunctive",
        "choices": ["Imperfect Subjunctive", "Perfect Subjunctive", "Present Subjunctive", "Pluperfect Subjunctive"],
        "explanation": "Primary sequence uses the Perfect Subjunctive to show an action happened prior to the present/future main verb."
      },

      // --- PART 2: IDENTIFYING THE MAIN VERB SEQUENCE ---
      {
        "id": "m1-201", "type": "mc", "badge": "MAIN VERB",
        "prompt": "Determine the sequence of the main verb: <strong>Rogat</strong> quid fēcerīs.",
        "hint": "rogat = he asks.",
        "correct": "Primary",
        "choices": ["Primary", "Secondary"],
        "explanation": "Rogat is present tense, which makes it Primary Sequence."
      },
      {
        "id": "m1-202", "type": "mc", "badge": "MAIN VERB",
        "prompt": "Determine the sequence of the main verb: <strong>Rogāvit</strong> quid facerēs.",
        "hint": "rogāvit = he asked.",
        "correct": "Secondary",
        "choices": ["Primary", "Secondary"],
        "explanation": "Rogāvit is perfect tense, which makes it Secondary Sequence."
      },
      {
        "id": "m1-203", "type": "mc", "badge": "MAIN VERB",
        "prompt": "Determine the sequence of the main verb: <strong>Audiēbat</strong> tē loquentem.",
        "hint": "audiēbat = he was hearing.",
        "correct": "Secondary",
        "choices": ["Primary", "Secondary"],
        "explanation": "Audiēbat is imperfect tense, which makes it Secondary Sequence."
      },
      {
        "id": "m1-204", "type": "mc", "badge": "MAIN VERB",
        "prompt": "Determine the sequence of the main verb: <strong>Dīcet</strong> sē ventūrum esse.",
        "hint": "dīcet = he will say.",
        "correct": "Primary",
        "choices": ["Primary", "Secondary"],
        "explanation": "Dīcet is future tense, which makes it Primary Sequence."
      },
      {
        "id": "m1-205", "type": "mc", "badge": "MAIN VERB",
        "prompt": "Determine the sequence of the main verb: <strong>Cucurrerant</strong> ut hostem effugerent.",
        "hint": "cucurrerant = they had run.",
        "correct": "Secondary",
        "choices": ["Primary", "Secondary"],
        "explanation": "Cucurrerant is pluperfect tense, which makes it Secondary Sequence."
      },

      // --- PART 3: APPLYING THE RULES ---
      {
        "id": "m1-301", "type": "mc", "badge": "APPLY SOT",
        "prompt": "Rogat quid <strong>faciant</strong>. (He asks what they are doing.)<br>Why is <em>faciant</em> in the present subjunctive?",
        "hint": "Look at the main verb 'rogat'.",
        "correct": "Primary sequence, simultaneous action",
        "choices": ["Secondary sequence, simultaneous action", "Primary sequence, prior action", "Primary sequence, simultaneous action", "Secondary sequence, prior action"],
        "explanation": "Rogat (present = primary sequence). Faciant (present subj = same time). He asks (now) what they are doing (now)."
      },
      {
        "id": "m1-302", "type": "mc", "badge": "APPLY SOT",
        "prompt": "Rogābat quid <strong>fēcissent</strong>. (He was asking what they had done.)<br>Why is <em>fēcissent</em> in the pluperfect subjunctive?",
        "hint": "Look at the main verb 'rogābat'.",
        "correct": "Secondary sequence, prior action",
        "choices": ["Secondary sequence, simultaneous action", "Primary sequence, prior action", "Secondary sequence, prior action", "Primary sequence, simultaneous action"],
        "explanation": "Rogābat (imperfect = secondary sequence). Fēcissent (pluperfect subj = prior time). He was asking (past) what they had ALREADY done (prior to the asking)."
      },
      {
        "id": "m1-303", "type": "mc", "badge": "APPLY SOT",
        "prompt": "Nesciō cūr <strong>vēnerit</strong>. (I do not know why he came.)<br>Why is <em>vēnerit</em> in the perfect subjunctive?",
        "hint": "Nesciō = present tense.",
        "correct": "Primary sequence, prior action",
        "choices": ["Secondary sequence, prior action", "Primary sequence, prior action", "Primary sequence, simultaneous action", "Secondary sequence, simultaneous action"],
        "explanation": "Nesciō (present = primary sequence). He ALREADY came, so the action is prior. Primary + prior = perfect subjunctive."
      },
      {
        "id": "m1-304", "type": "mc", "badge": "APPLY SOT",
        "prompt": "Mīlitēs pugnāvērunt ut <strong>vincerent</strong>. (The soldiers fought so that they might win.)<br>Why is <em>vincerent</em> in the imperfect subjunctive?",
        "hint": "pugnāvērunt = perfect tense.",
        "correct": "Secondary sequence, simultaneous/subsequent action",
        "choices": ["Primary sequence, simultaneous/subsequent action", "Secondary sequence, prior action", "Secondary sequence, simultaneous/subsequent action", "Primary sequence, prior action"],
        "explanation": "Pugnāvērunt (perfect = secondary sequence). Purpose clauses always use simultaneous/subsequent time. Secondary + simultaneous = imperfect subjunctive."
      },

      // --- PART 4: FILL IN THE BLANK (Multiple Choice) ---
      {
        "id": "m1-401", "type": "mc", "badge": "CHOOSE TENSE",
        "prompt": "Dīcit quid heri _______. (He says what you DID yesterday).",
        "hint": "Dīcit = present. Action is prior.",
        "correct": "fēcerīs",
        "choices": ["faciās", "fēcerīs", "facerēs", "fēcissēs"],
        "explanation": "Primary sequence + prior action = Perfect subjunctive (fēcerīs)."
      },
      {
        "id": "m1-402", "type": "mc", "badge": "CHOOSE TENSE",
        "prompt": "Dīxit quid eō tempore _______. (He said what you WERE DOING at that time).",
        "hint": "Dīxit = perfect. Action is simultaneous.",
        "correct": "facerēs",
        "choices": ["faciās", "fēcerīs", "facerēs", "fēcissēs"],
        "explanation": "Secondary sequence + simultaneous action = Imperfect subjunctive (facerēs)."
      },
      {
        "id": "m1-403", "type": "mc", "badge": "CHOOSE TENSE",
        "prompt": "Dīxit quid prīdiē _______. (He said what you HAD DONE the day before).",
        "hint": "Dīxit = perfect. Action is prior.",
        "correct": "fēcissēs",
        "choices": ["faciās", "fēcerīs", "facerēs", "fēcissēs"],
        "explanation": "Secondary sequence + prior action = Pluperfect subjunctive (fēcissēs)."
      },
      {
        "id": "m1-404", "type": "mc", "badge": "CHOOSE TENSE",
        "prompt": "Dīcit quid nunc _______. (He says what you ARE DOING now).",
        "hint": "Dīcit = present. Action is simultaneous.",
        "correct": "faciās",
        "choices": ["faciās", "fēcerīs", "facerēs", "fēcissēs"],
        "explanation": "Primary sequence + simultaneous action = Present subjunctive (faciās)."
      },

      // --- PART 5: TYPE-IN (Conjugating to fit the sequence) ---
      {
        "id": "m1-501", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Rogat quid tū ______ (facere). <br><em>He asks what you are doing (now).</em>",
        "hint": "Primary + simultaneous = present subjunctive. 2nd person singular.",
        "answers": ["facias"],
        "explanation": "faciās. (Present subjunctive)."
      },
      {
        "id": "m1-502", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Rogat quid tū heri ______ (facere). <br><em>He asks what you did (yesterday).</em>",
        "hint": "Primary + prior = perfect subjunctive. 2nd person singular.",
        "answers": ["feceris"],
        "explanation": "fēcerīs. (Perfect subjunctive)."
      },
      {
        "id": "m1-503", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Rogābat quid tū ______ (facere). <br><em>He was asking what you were doing.</em>",
        "hint": "Secondary + simultaneous = imperfect subjunctive. 2nd person singular.",
        "answers": ["faceres"],
        "explanation": "facerēs. (Imperfect subjunctive)."
      },
      {
        "id": "m1-504", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Rogābat quid tū prīdiē ______ (facere). <br><em>He was asking what you had done.</em>",
        "hint": "Secondary + prior = pluperfect subjunctive. 2nd person singular.",
        "answers": ["fecisses"],
        "explanation": "fēcissēs. (Pluperfect subjunctive)."
      },
      {
        "id": "m1-505", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Nescīmus cūr hostēs ______ (fugere). <br><em>We do not know why the enemies are fleeing.</em>",
        "hint": "Nescīmus = present. Action = simultaneous. 3rd plural present subjunctive of fugere.",
        "answers": ["fugiant"],
        "explanation": "fugiant. (Primary + simultaneous)."
      },
      {
        "id": "m1-506", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Nesciēbāmus cūr hostēs ______ (fugere). <br><em>We did not know why the enemies were fleeing.</em>",
        "hint": "Nesciēbāmus = imperfect. Action = simultaneous. 3rd plural imperfect subjunctive of fugere.",
        "answers": ["fugerent"],
        "explanation": "fugerent. (Secondary + simultaneous)."
      },
      {
        "id": "m1-507", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Sciō quārē mīlitēs ______ (vincere). <br><em>I know why the soldiers won.</em>",
        "hint": "Sciō = present. Action = prior. 3rd plural perfect subjunctive of vincere.",
        "answers": ["vicerint"],
        "explanation": "vīcerint. (Primary + prior)."
      },
      {
        "id": "m1-508", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Scīvī quārē mīlitēs ______ (vincere). <br><em>I knew why the soldiers had won.</em>",
        "hint": "Scīvī = perfect. Action = prior. 3rd plural pluperfect subjunctive of vincere.",
        "answers": ["vicissent"],
        "explanation": "vīcissent. (Secondary + prior)."
      },
      {
        "id": "m1-509", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Mīlitēs missī sunt ut oppidum ______ (dēfendere). <br><em>The soldiers were sent to defend the town.</em>",
        "hint": "missī sunt = perfect passive (Secondary). Purpose requires simultaneous/subsequent. 3rd plural imperfect active subjunctive.",
        "answers": ["defenderent"],
        "explanation": "dēfenderent. (Secondary sequence -> Imperfect subjunctive for purpose clauses)."
      },
      {
        "id": "m1-510", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>Imperātor monet mīlitēs nē ______ (discēdere). <br><em>The general warns the soldiers not to leave.</em>",
        "hint": "monet = present (Primary). Indirect Command requires simultaneous. 3rd plural present active subjunctive.",
        "answers": ["discedant"],
        "explanation": "discēdant. (Primary sequence -> Present subjunctive for indirect commands)."
      },

      // --- PART 6: EXAM TRAPS (Passive & Deponents in SOT) ---
      {
        "id": "m1-601", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Nescio cūr urbs <strong>capta sit</strong>.<br>What is the tense and sequence here?",
        "hint": "Nescio is present. capta sit is a two-word passive.",
        "correct": "Perfect subjunctive, primary sequence",
        "choices": ["Perfect subjunctive, primary sequence", "Pluperfect subjunctive, secondary sequence", "Present subjunctive, primary sequence", "Imperfect subjunctive, secondary sequence"],
        "explanation": "Nescio (present) = primary. Capta sit = perfect passive subjunctive (action happened prior). 'I do not know why the city was captured.'"
      },
      {
        "id": "m1-602", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Nesciēbam cūr urbs <strong>capta esset</strong>.<br>What is the tense and sequence here?",
        "hint": "Nesciēbam is imperfect. capta esset is a two-word passive.",
        "correct": "Pluperfect subjunctive, secondary sequence",
        "choices": ["Perfect subjunctive, primary sequence", "Pluperfect subjunctive, secondary sequence", "Present subjunctive, primary sequence", "Imperfect subjunctive, secondary sequence"],
        "explanation": "Nesciēbam (imperfect) = secondary. Capta esset = pluperfect passive subjunctive (action happened prior). 'I did not know why the city had been captured.'"
      },
      {
        "id": "m1-603", "type": "typein", "badge": "FORM",
        "prompt": "Translate the verb: <br>He asked why the men <strong>had spoken</strong>. (loquī - deponent) <br>Rogāvit cūr virī ______.",
        "hint": "Rogāvit = secondary. Action = prior. Need 3rd plural pluperfect subjunctive of a deponent verb (PPP + esse).",
        "answers": ["locuti essent"],
        "explanation": "locūtī essent. (Secondary + prior = Pluperfect subjunctive. Because it's deponent, it looks passive: locūtī + essent)."
      },
      {
        "id": "m1-604", "type": "typein", "badge": "FORM",
        "prompt": "Translate the verb: <br>He asks why the men <strong>are speaking</strong>. (loquī - deponent) <br>Rogat cūr virī ______.",
        "hint": "Rogat = primary. Action = simultaneous. Need 3rd plural present subjunctive of a deponent verb.",
        "answers": ["loquantur"],
        "explanation": "loquantur. (Primary + simultaneous = Present subjunctive. Deponent takes passive ending: loqu- + a + ntur)."
      },
      {
        "id": "m1-605", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "If a main verb is a <strong>Historical Present</strong> (a present tense verb used to narrate past events vividly), what sequence does the subordinate clause usually take?",
        "hint": "Even though it looks present, it's narrating the past.",
        "correct": "Secondary",
        "choices": ["Primary", "Secondary", "It takes the indicative", "Both are equally common with no preference"],
        "explanation": "Historical presents are typically treated as past tenses in Latin grammar, so they trigger Secondary Sequence (Imperfect/Pluperfect subjunctives)."
      }

      // Historical presents might be a little too advanced ... we'll see
    ]
  },

  "independent_uses": {
    "id": "independent_uses",
    "title": "Independent Subjunctive",
    "badge": "M2",
    "description": "Subjunctives that stand alone in main clauses. Master the Hortatory, Jussive, Optative, and Deliberative uses.",
    "concepts": ["Hortatory", "Jussive", "Optative", "Deliberative"],
    "questions": [
      // --- HORTATORY (Let us...) ---
      {
        "id": "m2-101", "type": "mc", "badge": "IDENTIFY",
        "prompt": "<strong>Eāmus</strong> ad castra statim!<br>Identify the use of the subjunctive.",
        "hint": "1st person plural, encouraging action.",
        "correct": "Hortatory",
        "choices": ["Jussive", "Hortatory", "Optative", "Deliberative"],
        "explanation": "Hortatory subjunctives are 1st person plural ('Let us...'). Eamus = Let us go."
      },
      {
        "id": "m2-102", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Nē in urbe maneāmus.</strong>",
        "hint": "maneamus is 1st person plural. nē makes it negative.",
        "correct": "Let us not stay in the city.",
        "choices": ["Let them not stay in the city.", "We are not staying in the city.", "Let us not stay in the city.", "If only we were not in the city."],
        "explanation": "Hortatory negative is formed with 'nē'. Maneāmus = let us stay. Nē maneāmus = let us not stay."
      },
      {
        "id": "m2-103", "type": "typein", "badge": "FORM",
        "prompt": "Fill in the blank for the Hortatory subjunctive: 'Let us love Rome!'<br>______ Romam!",
        "hint": "1st person plural present active subjunctive of amare.",
        "answers": ["amemus"],
        "explanation": "amēmus (Let us love)."
      },
      {
        "id": "m2-104", "type": "typein", "badge": "FORM",
        "prompt": "Fill in the blank for the negative Hortatory: 'Let us not run!'<br>______ curramus!",
        "hint": "What negative word is used for Hortatory subjunctives?",
        "answers": ["ne"],
        "explanation": "nē is used for negative Hortatory and Jussive subjunctives. (nōn is only for Deliberative)."
      },
      {
        "id": "m2-105", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Moriamur et in media arma ruamus. (Vergil)<br>What type of subjunctive are <em>moriamur</em> and <em>ruamus</em>?",
        "hint": "1st person plural.",
        "correct": "Hortatory",
        "choices": ["Optative", "Deliberative", "Jussive", "Hortatory"],
        "explanation": "'Let us die and rush into the middle of the weapons.' 1st person plural commands."
      },
      {
        "id": "m2-106", "type": "typein", "badge": "FORM",
        "prompt": "Give the correct Latin for: 'Let us drink!' (bibere)",
        "hint": "1st person plural present active subjunctive (3rd conjugation).",
        "answers": ["bibamus"],
        "explanation": "bibāmus. (3rd conjugation characteristic vowel is 'a' in present subjunctive)."
      },
      {
        "id": "m2-107", "type": "mc", "badge": "TRANSLATE",
        "prompt": "Translate: <strong>Nē dēspērēmus!</strong>",
        "hint": "desperare = to despair.",
        "correct": "Let us not despair!",
        "choices": ["Let us not despair!", "They should not despair!", "If only we did not despair!", "Why shouldn't we despair?"],
        "explanation": "1st person plural present subjunctive + nē = negative Hortatory."
      },
      {
        "id": "m2-108", "type": "typein", "badge": "FORM",
        "prompt": "Give the correct Latin for: 'Let us leave!' (discēdere)",
        "hint": "1st person plural present active subjunctive.",
        "answers": ["discedamus"],
        "explanation": "discēdāmus. (From discēdere, 3rd conjugation)."
      },

      // --- JUSSIVE (Let him/them...) ---
      {
        "id": "m2-201", "type": "mc", "badge": "IDENTIFY",
        "prompt": "<strong>Veniant</strong> omnēs mīlitēs!<br>Identify the use of the subjunctive.",
        "hint": "3rd person plural.",
        "correct": "Jussive",
        "choices": ["Jussive", "Hortatory", "Optative", "Deliberative"],
        "explanation": "Jussive subjunctives act as 3rd person commands ('Let them...'). Veniant = Let them come."
      },
      {
        "id": "m2-202", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Nē hostēs vincant.</strong>",
        "hint": "vincant = 3rd plural present subjunctive.",
        "correct": "Let the enemies not conquer.",
        "choices": ["Let us not conquer the enemies.", "Let the enemies not conquer.", "The enemies are not conquering.", "Why should the enemies conquer?"],
        "explanation": "Negative Jussive. 'Let the enemies not conquer.'"
      },
      {
        "id": "m2-203", "type": "typein", "badge": "FORM",
        "prompt": "Fill in the blank for the Jussive subjunctive: 'Let the king speak!'<br>Rex ______!",
        "hint": "3rd person singular present active subjunctive of dicere (3rd conj).",
        "answers": ["dicat"],
        "explanation": "dīcere -> dīcat (Let him speak)."
      },
      {
        "id": "m2-204", "type": "typein", "badge": "FORM",
        "prompt": "Fill in the blank for the Jussive subjunctive: 'Let the boys be brave!'<br>Pueri fortes ______!",
        "hint": "3rd person plural present subjunctive of esse.",
        "answers": ["sint"],
        "explanation": "sint (Let them be)."
      },
      {
        "id": "m2-205", "type": "mc", "badge": "IDENTIFY",
        "prompt": "<strong>Dicat</strong> quid sentiat.<br>What use is <em>dicat</em>?",
        "hint": "3rd person singular main verb.",
        "correct": "Jussive",
        "choices": ["Hortatory", "Jussive", "Optative", "Deliberative"],
        "explanation": "'Let him say [what he feels].' (Note: sentiat is an indirect question, but dicat is independent Jussive)."
      },
      {
        "id": "m2-206", "type": "typein", "badge": "FORM",
        "prompt": "Give the correct Latin for: 'Let the girl read!' (legere)",
        "hint": "3rd person singular present active subjunctive.",
        "answers": ["legat"],
        "explanation": "legat (Jussive)."
      },
      {
        "id": "m2-207", "type": "mc", "badge": "TRANSLATE",
        "prompt": "Translate: <strong>Nē hoc credant.</strong>",
        "hint": "credant = 3rd plural.",
        "correct": "Let them not believe this.",
        "choices": ["Let us not believe this.", "Let them not believe this.", "If only they didn't believe this.", "They shouldn't believe this, should they?"],
        "explanation": "Negative Jussive command. 'Let them not...'"
      },
      {
        "id": "m2-208", "type": "typein", "badge": "FORM",
        "prompt": "Give the correct Latin for: 'Let the general order!' (imperare)",
        "hint": "1st conjugation, 3rd singular present active subjunctive.",
        "answers": ["imperet"],
        "explanation": "imperet. (Characteristic vowel 'a' shifts to 'e')."
      },
      {
        "id": "m2-209", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Arma <strong>capiantur</strong> statim!<br>Identify the use of the bolded verb.",
        "hint": "3rd person plural, passive.",
        "correct": "Jussive",
        "choices": ["Jussive", "Hortatory", "Optative", "Deliberative"],
        "explanation": "Jussive command in the passive voice. 'Let the weapons be taken up immediately!'"
      },

      // --- OPTATIVE (Wishes) ---
      {
        "id": "m2-301", "type": "mc", "badge": "RULE",
        "prompt": "What tense of the subjunctive is used in an Optative clause to express a wish that is <strong>possible in the future</strong>?",
        "hint": "The most 'current' subjunctive tense.",
        "correct": "Present",
        "choices": ["Present", "Imperfect", "Perfect", "Pluperfect"],
        "explanation": "Present subjunctive is used for future, possible wishes. 'May he survive!'"
      },
      {
        "id": "m2-302", "type": "mc", "badge": "RULE",
        "prompt": "What tense of the subjunctive is used in an Optative clause to express a wish that is <strong>impossible in the present</strong>?",
        "hint": "Same as the Present Contrary-to-Fact conditional.",
        "correct": "Imperfect",
        "choices": ["Present", "Imperfect", "Perfect", "Pluperfect"],
        "explanation": "Imperfect subjunctive = impossible present wish. 'If only he were here now (but he isn't)!'"
      },
      {
        "id": "m2-303", "type": "mc", "badge": "RULE",
        "prompt": "What tense of the subjunctive is used in an Optative clause to express a wish that is <strong>impossible in the past</strong>?",
        "hint": "Same as the Past Contrary-to-Fact conditional.",
        "correct": "Pluperfect",
        "choices": ["Present", "Imperfect", "Perfect", "Pluperfect"],
        "explanation": "Pluperfect subjunctive = impossible past wish. 'If only he had not died!'"
      },
      {
        "id": "m2-304", "type": "typein", "badge": "TRIGGER WORD",
        "prompt": "What Latin particle (starting with 'u') almost always introduces an Optative subjunctive?",
        "hint": "Means 'if only' or 'would that'.",
        "answers": ["utinam"],
        "explanation": "Utinam is the explicit trigger word for wishes."
      },
      {
        "id": "m2-305", "type": "mc", "badge": "TRANSLATE",
        "prompt": "<strong>Utinam Romae essem!</strong><br>How is this translated?",
        "hint": "essem = imperfect subjunctive. This means the wish is impossible right now.",
        "correct": "If only I were in Rome!",
        "choices": ["If only I had been in Rome!", "May I be in Rome!", "If only I were in Rome!", "Let me be in Rome!"],
        "explanation": "Imperfect subjunctive = present unfulfilled wish. 'If only I were in Rome [but I am currently not].'"
      },
      {
        "id": "m2-306", "type": "mc", "badge": "TRANSLATE",
        "prompt": "<strong>Utinam nē venisset!</strong><br>How is this translated?",
        "hint": "venisset = pluperfect subjunctive. This means the wish is impossible in the past.",
        "correct": "If only he had not come!",
        "choices": ["If only he would not come!", "Let him not come!", "If only he had not come!", "If only he were not coming!"],
        "explanation": "Pluperfect subjunctive = past unfulfilled wish. 'If only he had not come!'"
      },
      {
        "id": "m2-307", "type": "mc", "badge": "IDENTIFY",
        "prompt": "<strong>Utinam dī vōbīs pacem dent!</strong><br>What type of wish is this?",
        "hint": "dent = present subjunctive.",
        "correct": "Future possible wish",
        "choices": ["Future possible wish", "Present impossible wish", "Past impossible wish", "Jussive command"],
        "explanation": "Present subjunctive = future possible wish. 'May the gods grant you peace!'"
      },
      {
        "id": "m2-308", "type": "typein", "badge": "FORM",
        "prompt": "Translate the verb: 'If only you <strong>had warned</strong> me!'<br>Utinam me ______!",
        "hint": "2nd person singular pluperfect active subjunctive of monere.",
        "answers": ["monuisses"],
        "explanation": "monuisses. Pluperfect because it's an impossible wish in the past."
      },
      {
        "id": "m2-309", "type": "mc", "badge": "NEGATIVE",
        "prompt": "Which word is used to negate an Optative subjunctive?",
        "hint": "Same as Hortatory and Jussive.",
        "correct": "nē",
        "choices": ["nōn", "nē", "nūllus", "numquam"],
        "explanation": "Utinam nē (or sometimes just nē) is used to negate a wish."
      },
      {
        "id": "m2-310", "type": "mc", "badge": "TRANSLATE",
        "prompt": "<strong>Utinam vīveret!</strong><br>How is this translated?",
        "hint": "viveret = imperfect subjunctive.",
        "correct": "If only he were alive!",
        "choices": ["May he live!", "If only he were alive!", "If only he had lived!", "Let him live!"],
        "explanation": "Imperfect subjunctive = impossible present wish. 'If only he were alive (now) [but he is dead].'"
      },
      {
        "id": "m2-311", "type": "mc", "badge": "TRANSLATE",
        "prompt": "<strong>Utinam vincāmus!</strong><br>How is this translated?",
        "hint": "vincamus = present subjunctive.",
        "correct": "May we win!",
        "choices": ["If only we were winning!", "May we win!", "If only we had won!", "We are going to win!"],
        "explanation": "Present subjunctive = future possible wish. 'May we win!'"
      },
      {
        "id": "m2-312", "type": "typein", "badge": "FORM",
        "prompt": "Give the correct Latin for: 'If only they had fled!' (fugere)",
        "hint": "3rd person plural pluperfect active subjunctive.",
        "answers": ["fugissent"],
        "explanation": "fūgissent. (Pluperfect = past impossible wish)."
      },
      {
        "id": "m2-313", "type": "typein", "badge": "FORM",
        "prompt": "Give the correct Latin for: 'May the king live!' (vivere)",
        "hint": "3rd person singular present active subjunctive.",
        "answers": ["vivat"],
        "explanation": "vīvat. (Present = future possible wish)."
      },
      {
        "id": "m2-314", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Which of these correctly expresses: 'If only she were speaking!'",
        "hint": "Present impossible wish.",
        "correct": "Utinam dīceret!",
        "choices": ["Utinam dīcat!", "Utinam dīceret!", "Utinam dīxisset!", "Utinam nē dīcat!"],
        "explanation": "Imperfect subjunctive (dīceret) is used for a present impossible wish."
      },
      {
        "id": "m2-315", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Which of these correctly expresses: 'If only we had not lost!'",
        "hint": "Past impossible wish, negative.",
        "correct": "Utinam nē āmīssissēmus!",
        "choices": ["Utinam nōn āmīssissēmus!", "Utinam nē āmīttāmus!", "Utinam nē āmīssissēmus!", "Utinam nē āmītterēmus!"],
        "explanation": "Optative uses 'nē' for the negative, and past impossible requires the pluperfect subjunctive."
      },

      // --- DELIBERATIVE (Rhetorical Questions) ---
      {
        "id": "m2-401", "type": "mc", "badge": "IDENTIFY",
        "prompt": "<strong>Quid faciam?</strong><br>Identify the use of the subjunctive.",
        "hint": "A question asked in doubt, weighing an action.",
        "correct": "Deliberative",
        "choices": ["Jussive", "Hortatory", "Optative", "Deliberative"],
        "explanation": "Deliberative subjunctives are rhetorical questions weighing a course of action. 'What am I to do?'"
      },
      {
        "id": "m2-402", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Quid dicerem?</strong>",
        "hint": "dicerem = imperfect subjunctive (past tense doubt).",
        "correct": "What was I to say?",
        "choices": ["What am I to say?", "What was I to say?", "Let me say something.", "If only I had spoken!"],
        "explanation": "Imperfect deliberative expresses past doubt. 'What was I to say?' or 'What should I have said?'"
      },
      {
        "id": "m2-403", "type": "mc", "badge": "NEGATIVE",
        "prompt": "Which word is used to negate a <strong>Deliberative</strong> subjunctive?",
        "hint": "This is the ONLY independent subjunctive that uses this negative!",
        "correct": "nōn",
        "choices": ["nē", "nōn", "nē nōn", "ut nōn"],
        "explanation": "Deliberative questions use NŌN. (e.g., Cur nōn eāmus? = Why shouldn't we go?). Hortatory, Jussive, and Optative all use NĒ."
      },
      {
        "id": "m2-404", "type": "typein", "badge": "FORM",
        "prompt": "Fill in the blank for the Deliberative: 'Where are we to remain?'<br>Ubi ______?",
        "hint": "1st person plural present active subjunctive of manere.",
        "answers": ["maneamus"],
        "explanation": "maneāmus (Where are we to stay?)"
      },
      {
        "id": "m2-405", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Cur <strong>nōn pugnēmus?</strong><br>Identify the use of the subjunctive.",
        "hint": "It's a question, and it's negated by nōn.",
        "correct": "Deliberative",
        "choices": ["Deliberative", "Hortatory", "Optative", "Jussive"],
        "explanation": "'Why should we not fight?' A rhetorical question weighing a course of action."
      },
      {
        "id": "m2-406", "type": "typein", "badge": "FORM",
        "prompt": "Give the correct Latin for: 'What am I to think?' (putare)",
        "hint": "1st person singular present active subjunctive.",
        "answers": ["putem"],
        "explanation": "putem. (1st conjugation present subjunctive)."
      },
      {
        "id": "m2-407", "type": "mc", "badge": "TRANSLATE",
        "prompt": "Translate: <strong>Quō eam?</strong>",
        "hint": "quo = to where. eam = 1st sg present subjunctive of ire.",
        "correct": "Where am I to go?",
        "choices": ["Where was I going?", "Where am I to go?", "Let me go there.", "If only I were going!"],
        "explanation": "Present deliberative expressing current doubt. 'Where am I to go?' or 'Where should I go?'"
      },
      {
        "id": "m2-408", "type": "mc", "badge": "TRANSLATE",
        "prompt": "Translate: <strong>Cūr in urbe remanērem?</strong>",
        "hint": "remanerem = imperfect subjunctive.",
        "correct": "Why was I to stay in the city?",
        "choices": ["Why should I stay in the city?", "Why was I to stay in the city?", "Let me not stay in the city.", "Why didn't I stay in the city?"],
        "explanation": "Imperfect deliberative expresses past doubt. 'Why was I to stay...?'"
      },
      {
        "id": "m2-409", "type": "typein", "badge": "FORM",
        "prompt": "Give the correct Latin for: 'Why shouldn't we leave?' (discēdere)",
        "hint": "Cur non + 1st plural present active subjunctive.",
        "answers": ["discedamus"],
        "explanation": "Cūr nōn discēdāmus? (Deliberatives use nōn for negation)."
      },
      {
        "id": "m2-410", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Which of these is a Deliberative subjunctive?",
        "hint": "Look for the question mark.",
        "correct": "Ubi fugiam?",
        "choices": ["Utinam fugiam!", "Nē fugiamus.", "Fugiant statim.", "Ubi fugiam?"],
        "explanation": "Deliberatives are always framed as questions."
      },

      // --- MIXED EXAM-STYLE DISCRIMINATION ---
      {
        "id": "m2-501", "type": "mc", "badge": "MIXED",
        "prompt": "Which of these independent subjunctives uses <strong>NŌN</strong> instead of <strong>NĒ</strong> for its negative?",
        "hint": "The one that is a question.",
        "correct": "Deliberative",
        "choices": ["Hortatory", "Jussive", "Optative", "Deliberative"],
        "explanation": "Deliberative uses nōn. The other three (Hortatory, Jussive, Optative) are all forms of commands/wishes and use nē."
      },
      {
        "id": "m2-502", "type": "mc", "badge": "MIXED",
        "prompt": "Read the sentence: <strong>Nē discēdat.</strong><br>What type is it?",
        "hint": "3rd person.",
        "correct": "Jussive",
        "choices": ["Hortatory", "Jussive", "Optative", "Deliberative"],
        "explanation": "3rd person negative command = Jussive ('Let him not depart')."
      },
      {
        "id": "m2-503", "type": "mc", "badge": "MIXED",
        "prompt": "Read the sentence: <strong>Utinam nē discessisset!</strong><br>What type is it?",
        "hint": "Utinam = wish.",
        "correct": "Optative",
        "choices": ["Hortatory", "Jussive", "Optative", "Deliberative"],
        "explanation": "Utinam triggers the Optative. Pluperfect makes it an impossible past wish ('If only he had not departed')."
      },
      {
        "id": "m2-504", "type": "mc", "badge": "MIXED",
        "prompt": "Read the sentence: <strong>Nē discēdāmus.</strong><br>What type is it?",
        "hint": "1st person plural.",
        "correct": "Hortatory",
        "choices": ["Hortatory", "Jussive", "Optative", "Deliberative"],
        "explanation": "1st person plural negative command = Hortatory ('Let us not depart')."
      },
      {
        "id": "m2-505", "type": "mc", "badge": "MIXED",
        "prompt": "Read the sentence: <strong>Cūr nōn discēdāmus?</strong><br>What type is it?",
        "hint": "Question + non.",
        "correct": "Deliberative",
        "choices": ["Hortatory", "Jussive", "Optative", "Deliberative"],
        "explanation": "Question weighing an action = Deliberative ('Why shouldn't we depart?')."
      },
      {
        "id": "m2-506", "type": "mc", "badge": "RULE",
        "prompt": "A Present CTF (unfulfilled present) wish uses which tense in the Optative?",
        "hint": "If only I *were* rich.",
        "correct": "Imperfect",
        "choices": ["Present", "Imperfect", "Perfect", "Pluperfect"],
        "explanation": "Imperfect Subjunctive = Present Unfulfilled Wish."
      },
      {
        "id": "m2-507", "type": "mc", "badge": "RULE",
        "prompt": "A Past CTF (unfulfilled past) wish uses which tense in the Optative?",
        "hint": "If only I *had* won.",
        "correct": "Pluperfect",
        "choices": ["Present", "Imperfect", "Perfect", "Pluperfect"],
        "explanation": "Pluperfect Subjunctive = Past Unfulfilled Wish."
      },
      {
        "id": "m2-508", "type": "mc", "badge": "MIXED",
        "prompt": "Which of these translations correctly renders <strong>Utinam Caesar adesset!</strong>",
        "hint": "adesset = imperfect subjunctive.",
        "correct": "If only Caesar were present!",
        "choices": ["May Caesar be present!", "If only Caesar were present!", "If only Caesar had been present!", "Let Caesar be present!"],
        "explanation": "Imperfect subjunctive means it is a present impossible wish. 'If only Caesar were present [right now, but he is not].'"
      },
      // Add these to MODULE_DB["independent_uses"].questions

      {
        "id": "m2-601", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "<strong>Nē hoc fēceris!</strong><br>How is this best translated for a Latin 3 exam?",
        "hint": "Perfect Subjunctive + nē in the 2nd person.",
        "correct": "Do not do this!",
        "choices": ["You might not do this.", "Do not do this!", "You didn't do this.", "May you not have done this."],
        "explanation": "This is the Prohibitive Subjunctive. While it looks like a perfect tense, it functions as a sharp, immediate negative command."
      },
      {
        "id": "m2-602", "type": "typein", "badge": "PROHIBITION",
        "prompt": "Translate using the Perfect Subjunctive: 'Do not fear!' (timēre; stem: timu-)",
        "hint": "Use 'nē' + 2nd person singular perfect active subjunctive.",
        "answers": ["ne timueris"],
        "explanation": "nē timueris. This is the standard way to issue a negative command in formal Latin."
      },
      {
        "id": "m2-603", "type": "mc", "badge": "DELIBERATIVE",
        "prompt": "<strong>Quid facerem?</strong><br>Translate this rhetorical question.",
        "hint": "Imperfect subjunctive = past doubt.",
        "correct": "What was I to do?",
        "choices": ["What am I to do?", "What was I to do?", "What will I do?", "What had I done?"],
        "explanation": "The imperfect subjunctive in a deliberative question refers to a dilemma in the past."
      },
      {
        "id": "m2-604", "type": "mc", "badge": "NEGATION",
        "prompt": "Identify the sentence that is grammatically <strong>INCORRECT</strong>:",
        "hint": "Check the negative words for independent uses.",
        "correct": "Nē quid agam?",
        "choices": ["Nē eāmus.", "Utinam nē venisset.", "Nē hoc fēceris.", "Nē quid agam?"],
        "explanation": "Deliberative questions (Quid agam?) are negated by 'nōn', not 'nē'. It should be 'Cūr nōn agam?'"
      },
      {
        "id": "m2-605", "type": "typein", "badge": "OPTATIVE",
        "prompt": "Translate into Latin: 'May the gods help us!' (diuvāre; 3pl: diuvent)",
        "hint": "Use the present subjunctive for a future possible wish. Gods = dī (nom. pl.).",
        "answers": ["di nos diuvent", "utinam di nos diuvent"],
        "explanation": "Dī nōs diuvent! (Present subjunctive for a wish that can still come true)."
      }

    ]
  },

  "purpose_result_indirect": {
    "id": "purpose_result_indirect",
    "title": "Purpose · Result · Indirect Command",
    "badge": "M3",
    "description": "The big three ut-clauses. The TSJCL exam loves to test your ability to tell these apart. Look for trigger words!",
    "concepts": ["Purpose Clauses", "Result Clauses", "Indirect Commands"],
    "questions": [
      // --- TRIGGER WORDS ---
      {
        "id": "m3-101", "type": "mc", "badge": "TRIGGER",
        "prompt": "Which of the following words in a main clause almost always triggers a <strong>Result</strong> clause?",
        "hint": "Means 'so' or 'to such a degree'.",
        "correct": "tam",
        "choices": ["tamen", "tam", "tum", "tandem"],
        "explanation": "'Tam' (so) is a classic T-word trigger for Result clauses. (e.g., He was SO brave THAT...)"
      },
      {
        "id": "m3-102", "type": "mc", "badge": "TRIGGER",
        "prompt": "Which of these verbs triggers an <strong>Indirect Command</strong>?",
        "hint": "Means 'to order'.",
        "correct": "imperō",
        "choices": ["intellegō", "imperō", "inveniō", "incipiō"],
        "explanation": "Verbs of ordering, warning, begging, and asking (impero, moneo, oro, rogo, persuadeo) trigger Indirect Commands."
      },
      {
        "id": "m3-103", "type": "mc", "badge": "TRIGGER",
        "prompt": "The words <strong>ita</strong>, <strong>sīc</strong>, and <strong>adeō</strong> trigger which type of clause?",
        "hint": "They all mean 'so' or 'in such a way'.",
        "correct": "Result",
        "choices": ["Purpose", "Result", "Indirect Command", "Indirect Question"],
        "explanation": "These adverbial triggers set up the consequence/result of an action."
      },
      {
        "id": "m3-104", "type": "mc", "badge": "TRIGGER",
        "prompt": "Which of these verbs triggers an <strong>Indirect Command</strong>?",
        "hint": "Means 'to persuade'.",
        "correct": "persuādeō",
        "choices": ["perveniō", "putō", "persuādeō", "pellō"],
        "explanation": "Persuadeo (to persuade) takes a dative object and an ut/nē + subjunctive clause."
      },

      // --- DISCRIMINATING CLAUSES ---
      {
        "id": "m3-201", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Mīlitēs cucurrērunt <strong>ut urbem caperent</strong>.<br>What type of clause is bolded?",
        "hint": "Answers 'why' they ran.",
        "correct": "Purpose",
        "choices": ["Result", "Purpose", "Indirect Command", "Indirect Question"],
        "explanation": "Purpose clause. There are no 'T-words' or ordering verbs in the main clause. 'They ran in order to capture the city.'"
      },
      {
        "id": "m3-202", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Puer <strong>tam</strong> dēfessus erat <strong>ut statim dormīret</strong>.<br>What type of clause is bolded?",
        "hint": "Look at the 'tam' (so).",
        "correct": "Result",
        "choices": ["Result", "Purpose", "Indirect Command", "Indirect Question"],
        "explanation": "Result clause. The 'tam' triggers the consequence: 'He was SO tired THAT he slept immediately.'"
      },
      {
        "id": "m3-203", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Māter fīlium <strong>monuit nē ad flūmen īret</strong>.<br>What type of clause is bolded?",
        "hint": "monuit = she warned/advised.",
        "correct": "Indirect Command",
        "choices": ["Result", "Purpose", "Indirect Command", "Indirect Question"],
        "explanation": "Indirect Command. Triggered by a verb of warning (monuit)."
      },
      {
        "id": "m3-204", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Gladiātor <strong>tantā</strong> vī pugnāvit <strong>ut hostem vinceret</strong>.<br>What type of clause is bolded?",
        "hint": "tantus/a/um = so great / such a great.",
        "correct": "Result",
        "choices": ["Result", "Purpose", "Indirect Command", "Indirect Question"],
        "explanation": "Result clause. Triggered by 'tantā' (with such great force that...)."
      },
      {
        "id": "m3-205", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Tē <strong>ōrō ut mē iuvēs</strong>.<br>What type of clause is bolded?",
        "hint": "ōrāre = to beg.",
        "correct": "Indirect Command",
        "choices": ["Result", "Purpose", "Indirect Command", "Indirect Question"],
        "explanation": "Indirect command. 'I beg you to help me.'"
      },
      {
        "id": "m3-206", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Lēgātī vēnērunt <strong>ut pācem peterent</strong>.<br>What type of clause is bolded?",
        "hint": "Why did the envoys come?",
        "correct": "Purpose",
        "choices": ["Result", "Purpose", "Indirect Command", "Indirect Question"],
        "explanation": "Purpose clause. 'They came to seek peace.'"
      },

      // --- NEGATIVE RULES (Nē vs. Ut Nōn) ---
      {
        "id": "m3-301", "type": "mc", "badge": "NEGATIVE",
        "prompt": "Which of these uses <strong>nē</strong> for its negative form?",
        "hint": "Two of them do, but Result does NOT.",
        "correct": "Purpose and Indirect Command",
        "choices": ["Result and Purpose", "Purpose and Indirect Command", "Result and Indirect Command", "Only Result"],
        "explanation": "Both Purpose ('in order that not') and Indirect Commands ('ordered not to') use NĒ. Result clauses use UT NŌN."
      },
      {
        "id": "m3-302", "type": "mc", "badge": "NEGATIVE",
        "prompt": "What is the negative word used to introduce a <strong>Result</strong> clause?",
        "hint": "Result clauses always keep the 'ut'.",
        "correct": "ut nōn",
        "choices": ["nē", "nōn", "ut nōn", "nē nōn"],
        "explanation": "Result clauses are the exception! They use 'ut nōn' (or ut nēmō, ut nihil) instead of nē."
      },
      {
        "id": "m3-303", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Ita mē gessī <strong>ut nēmō mē reprehenderet</strong>.<br>What type of clause is bolded?",
        "hint": "ut nēmō = that no one. Also look at 'Ita'.",
        "correct": "Result",
        "choices": ["Result", "Purpose", "Indirect Command", "Indirect Question"],
        "explanation": "Result clause. 'I conducted myself in such a way (Ita) that NO ONE (ut nēmō) blamed me.'"
      },
      {
        "id": "m3-304", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Fūgimus <strong>nē pūnīrēmur</strong>.<br>What type of clause is bolded?",
        "hint": "Why did we flee?",
        "correct": "Purpose",
        "choices": ["Result", "Purpose", "Indirect Command", "Indirect Question"],
        "explanation": "Negative purpose. 'We fled so that we would not be punished (lest we be punished).'"
      },
      {
        "id": "m3-305", "type": "typein", "badge": "NEGATIVE",
        "prompt": "Fill in the correct negative word: <br>Mihi persuasit ______ hoc facerem. (He persuaded me <strong>not</strong> to do this.)",
        "hint": "Negative Indirect Command.",
        "answers": ["ne"],
        "explanation": "nē. Indirect commands use nē to negate."
      },

      // --- RELATIVE CLAUSES OF PURPOSE ---
      {
        "id": "m3-401", "type": "mc", "badge": "RELATIVE PURPOSE",
        "prompt": "Mīsit nūntiōs <strong>quī rēgī haec dīcerent</strong>.<br>How should the bolded clause be translated?",
        "hint": "qui = in order that they...",
        "correct": "to say these things to the king",
        "choices": ["who were saying these things", "to say these things to the king", "because they said these things", "what they said to the king"],
        "explanation": "Relative clause of purpose. A relative pronoun (quī) replaces 'ut' when there is a clear antecedent. 'He sent messengers to say...'"
      },
      {
        "id": "m3-402", "type": "typein", "badge": "RELATIVE PURPOSE",
        "prompt": "Fill in the blank to create a Relative Purpose clause: <br>Arma cēpit ______ sē dēfenderet. (He took up arms <strong>to</strong> defend himself).",
        "hint": "Use the relative pronoun (masc, nom, sg) referring back to the implied subject, instead of 'ut'.",
        "answers": ["qui"],
        "explanation": "quī. 'He took up arms who might defend himself' = 'to defend himself.'"
      },

      // --- SEQUENCE OF TENSES APPLICATIONS ---
      {
        "id": "m3-501", "type": "mc", "badge": "SEQUENCE",
        "prompt": "Rogat ut <strong>veniāmus</strong>.<br>Why is the subjunctive in the present tense?",
        "hint": "Look at 'Rogat'.",
        "correct": "Primary sequence, simultaneous/subsequent action",
        "choices": ["Secondary sequence, simultaneous action", "Primary sequence, simultaneous/subsequent action", "Primary sequence, prior action", "Secondary sequence, prior action"],
        "explanation": "Rogat (present = primary). Purpose/Result/IndCmd only use Present or Imperfect subjunctive. Primary main verb -> Present subjunctive."
      },
      {
        "id": "m3-502", "type": "mc", "badge": "SEQUENCE",
        "prompt": "Rogāvit ut <strong>venīrēmus</strong>.<br>Why is the subjunctive in the imperfect tense?",
        "hint": "Look at 'Rogāvit'.",
        "correct": "Secondary sequence, simultaneous/subsequent action",
        "choices": ["Secondary sequence, simultaneous/subsequent action", "Primary sequence, simultaneous action", "Secondary sequence, prior action", "Primary sequence, prior action"],
        "explanation": "Rogāvit (perfect = secondary). Secondary main verb -> Imperfect subjunctive."
      },
      {
        "id": "m3-503", "type": "typein", "badge": "FORM",
        "prompt": "Conjugate the verb to fit the Sequence of Tenses:<br>Venit ut pacem ______ (petere). <br><em>He comes so that he may seek peace.</em>",
        "hint": "Venit (present). Needs 3rd person singular present subjunctive.",
        "answers": ["petat"],
        "explanation": "petat. (Primary sequence)."
      },
      {
        "id": "m3-504", "type": "typein", "badge": "FORM",
        "prompt": "Conjugate the verb to fit the Sequence of Tenses:<br>Vēnit ut pacem ______ (petere). <br><em>He came so that he might seek peace.</em>",
        "hint": "Vēnit (perfect). Needs 3rd person singular imperfect subjunctive.",
        "answers": ["peteret"],
        "explanation": "peteret. (Secondary sequence)."
      },

      // --- TRANSLATION AND PRODUCTION ---
      {
        "id": "m3-601", "type": "typein", "badge": "TRANSLATE",
        "prompt": "Type the correct Latin verb: <br>We fight so that we <strong>may be</strong> free.<br>Pugnāmus ut līberī ______ (esse).",
        "hint": "1st person plural present subjunctive of esse.",
        "answers": ["simus"],
        "explanation": "sīmus."
      },
      {
        "id": "m3-602", "type": "typein", "badge": "TRANSLATE",
        "prompt": "Type the correct Latin verb: <br>He ordered them <strong>to do</strong> this.<br>Eīs imperāvit ut hoc ______ (facere).",
        "hint": "3rd person plural imperfect subjunctive (secondary sequence).",
        "answers": ["facerent"],
        "explanation": "facerent."
      },
      {
        "id": "m3-603", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Tam clārē dīcit ut omnēs audiant.</strong>",
        "hint": "Tam = so. audiant = present subjunctive.",
        "correct": "He speaks so clearly that everyone hears.",
        "choices": ["He spoke so clearly that everyone heard.", "He speaks so clearly that everyone hears.", "He speaks clearly in order that everyone may hear.", "He speaks clearly to everyone listening."],
        "explanation": "Result clause in primary sequence."
      },
      {
        "id": "m3-604", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Mīlitem rogāvit nē sē pūnīret.</strong>",
        "hint": "rogāvit = asked. pūnīret = imperfect subjunctive.",
        "correct": "He asked the soldier not to punish him.",
        "choices": ["He asked the soldier to punish him.", "He asked the soldier not to punish him.", "The soldier asked not to be punished.", "He punished the soldier so he wouldn't ask."],
        "explanation": "Negative Indirect Command. 'He asked... that he not punish him.'"
      },
      {
        "id": "m3-605", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb: <br>The storm was so great that the ships <strong>were destroyed</strong>.<br>Tanta tempestās erat ut nāvēs ______ (dēlēre).",
        "hint": "3rd person plural imperfect passive subjunctive (2nd conj).",
        "answers": ["delerentur"],
        "explanation": "dēlērentur."
      },

      // Add to MODULE_DB["purpose_result_indirect"].questions

      {
        "id": "m3-701", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Vēnimus <strong>ut tē iuvārēmus.</strong>",
        "hint": "No 'so' word (tam, ita) and no 'ordering' verb in the main clause.",
        "correct": "Purpose Clause",
        "choices": ["Purpose Clause", "Result Clause", "Indirect Command", "Noun Clause"],
        "explanation": "This expresses the intent of the coming: 'We came in order to help you.'"
      },
      {
        "id": "m3-702", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Accidit <strong>ut lūna plēna esset.</strong>",
        "hint": "Accidit (it happens) is an impersonal verb.",
        "correct": "Substantive Clause of Result",
        "choices": ["Purpose Clause", "Substantive Clause of Result", "Indirect Command", "Relative Clause"],
        "explanation": "Verbs like 'accidit' (it happens) or 'efficit' (he brings it about) take result clauses as their direct objects or subjects."
      },
      {
        "id": "m3-703", "type": "typein", "badge": "NEGATIVE",
        "prompt": "Fill in the correct negative: <br>Tam fessus erat ______ dormīret. (He was so tired that he did <strong>not</strong> sleep).",
        "hint": "Result clauses are the ONLY ones in this group that use 'non'.",
        "answers": ["ut non"],
        "explanation": "Result clauses use 'ut nōn' for negation. Purpose and Indirect Commands would use 'nē'."
      },
      {
        "id": "m3-704", "type": "mc", "badge": "TRIGGER",
        "prompt": "Which of these adverbs triggers a <strong>Result</strong> clause?",
        "hint": "Means 'to such an extent'.",
        "correct": "adeō",
        "choices": ["tamen", "adeō", "anteā", "apud"],
        "explanation": "Adeō (to such an extent), ita (so/in such a way), and tam (so) are the big result triggers."
      },
      {
        "id": "m3-705", "type": "typein", "badge": "FORM",
        "prompt": "Translate the verb: <br>He ordered the soldiers <strong>to not flee</strong>.<br>Mīlitibus imperāvit ______.",
        "hint": "Indirect command + negative. 3rd person plural imperfect active subjunctive (secondary sequence).",
        "answers": ["ne fugerent"],
        "explanation": "nē fugerent. Imperō takes the Dative + nē + subjunctive."
      },
      {
        "id": "m3-706", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "How do you translate <strong>nē</strong> in a Purpose Clause?",
        "hint": "Expresses a negative intention.",
        "correct": "lest / in order that... not",
        "choices": ["that", "lest / in order that... not", "that... not", "whether"],
        "explanation": "Nē in a purpose clause is 'lest' or 'so that... not'. (Don't confuse it with 'that' in a fear clause!)."
      },
      {
        "id": "m3-707", "type": "typein", "badge": "RELATIVE PURPOSE",
        "prompt": "Rewrite using a Relative Purpose Clause: <br>Mīsit nūntiōs <strong>ut pācem peterent</strong>.",
        "hint": "Replace 'ut' with the nominative plural masculine relative pronoun.",
        "answers": ["qui pacem peterent"],
        "explanation": "quī pācem peterent. Relative pronouns can replace 'ut' when there is a clear antecedent (nūntiōs)."
      },
      {
        "id": "m3-708", "type": "mc", "badge": "SOT",
        "prompt": "Pugnant ut <strong>vincant</strong>. <br>If you change 'Pugnant' to 'Pugnābant', what does 'vincant' become?",
        "hint": "Shift from Primary to Secondary sequence.",
        "correct": "vincerent",
        "choices": ["vīcerint", "vincerent", "vīcissent", "vincerentur"],
        "explanation": "Secondary sequence (past tense) requires the imperfect subjunctive for simultaneous/subsequent action."
      }

    ]
  },

  "cum_clauses": {
    "id": "cum_clauses",
    "title": "Cum Clauses",
    "badge": "M4",
    "description": "Cum can mean 'with' (ablative), but with a subjunctive, it means when, since, or although. Know the markers.",
    "concepts": ["Circumstantial", "Causal", "Concessive"],
    "questions": [
      // --- PREPOSITION VS. CONJUNCTION TRAPS ---
      {
        "id": "m4-101", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Read the sentence: <strong>Cum amīcīs</strong> ad forum ambulābam.<br>How should <em>cum</em> be translated here?",
        "hint": "Look at the case of 'amīcīs'. Is there a subjunctive verb?",
        "correct": "With",
        "choices": ["When", "Since", "Although", "With"],
        "explanation": "Here, 'cum' is a preposition taking the ablative case (amīcīs). There is no subjunctive verb. It means 'with friends'."
      },
      {
        "id": "m4-102", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Read the sentence: <strong>Cum amīcī adessent</strong>, laetī erāmus.<br>How should <em>cum</em> be translated here?",
        "hint": "adessent = imperfect subjunctive.",
        "correct": "Since / When",
        "choices": ["Since / When", "With", "Although", "In order to"],
        "explanation": "Here, 'cum' is a conjunction taking a subjunctive verb (adessent). It means 'Since the friends were present' or 'When the friends were present'."
      },
      {
        "id": "m4-103", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Which of these sentences uses <em>cum</em> as a <strong>conjunction</strong>?",
        "hint": "Look for the sentence with a subjunctive verb.",
        "correct": "Cum Caesar in Galliam vēnisset, vīcit.",
        "choices": ["Cum magnā laude pugnāvit.", "Mīles cum rēge dīxit.", "Cum Caesar in Galliam vēnisset, vīcit.", "Cum tē in urbe manēbō."],
        "explanation": "'vēnisset' is pluperfect subjunctive, making 'cum' a conjunction (When Caesar had come into Gaul...). The others use ablative nouns (laude, rēge, tē)."
      },

      // --- IDENTIFYING THE 3 TYPES OF CUM CLAUSES ---
      {
        "id": "m4-201", "type": "mc", "badge": "TRIGGER WORD",
        "prompt": "What word in the main clause almost always indicates that the <em>cum</em> clause is <strong>Concessive</strong> (Although)?",
        "hint": "Means 'nevertheless'.",
        "correct": "tamen",
        "choices": ["tandem", "tamen", "tam", "tot"],
        "explanation": "If you see 'tamen' (nevertheless) in the main clause, the 'cum' clause MUST be concessive (Although... nevertheless...)."
      },
      {
        "id": "m4-202", "type": "mc", "badge": "IDENTIFY",
        "prompt": "<strong>Cum</strong> fortiter pugnārent, tamen superātī sunt.<br>What type of cum clause is this?",
        "hint": "Look for 'tamen'.",
        "correct": "Concessive",
        "choices": ["Circumstantial", "Causal", "Concessive", "Temporal"],
        "explanation": "Concessive. 'ALTHOUGH they fought bravely, nevertheless they were conquered.'"
      },
      {
        "id": "m4-203", "type": "mc", "badge": "IDENTIFY",
        "prompt": "<strong>Cum</strong> flūmen altum esset, trānsīre nōn potuimus.<br>What type of cum clause is this?",
        "hint": "The depth of the river is the REASON they couldn't cross.",
        "correct": "Causal",
        "choices": ["Circumstantial", "Causal", "Concessive", "Temporal"],
        "explanation": "Causal. 'SINCE the river was deep, we could not cross.'"
      },
      {
        "id": "m4-204", "type": "mc", "badge": "IDENTIFY",
        "prompt": "<strong>Cum</strong> Caesar Rōmam vēnisset, in senātum īvit.<br>What type of cum clause is this?",
        "hint": "This sets the historical scene.",
        "correct": "Circumstantial",
        "choices": ["Circumstantial", "Causal", "Concessive", "Temporal"],
        "explanation": "Circumstantial. 'WHEN Caesar had come to Rome, he went into the senate.'"
      },
      {
        "id": "m4-205", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Cum hoc scīrem, tacuī.</strong>",
        "hint": "scīrem = imperfect subjunctive. tacuī = I was silent.",
        "correct": "Since I knew this, I was silent.",
        "choices": ["With this knowledge, I was silent.", "Since I knew this, I was silent.", "Although I knew this, nevertheless I spoke.", "When I know this, I will be silent."],
        "explanation": "Causal. 'Since I knew this...'"
      },
      {
        "id": "m4-206", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Cum hoc scīrem, tamen dīxī.</strong>",
        "hint": "Notice the 'tamen'.",
        "correct": "Although I knew this, nevertheless I spoke.",
        "choices": ["When I knew this, I spoke.", "Since I knew this, I spoke.", "Although I knew this, nevertheless I spoke.", "I spoke with this knowledge."],
        "explanation": "Concessive. 'Although I knew this...'"
      },

      // --- SEQUENCE OF TENSES IN CUM CLAUSES ---
      {
        "id": "m4-301", "type": "mc", "badge": "SEQUENCE",
        "prompt": "Cum dux <strong>interfectus esset</strong>, mīlitēs fūgērunt.<br>Why is the subjunctive pluperfect?",
        "hint": "fūgērunt is perfect tense (secondary).",
        "correct": "Secondary sequence, prior action",
        "choices": ["Primary sequence, prior action", "Secondary sequence, prior action", "Secondary sequence, simultaneous action", "Primary sequence, simultaneous action"],
        "explanation": "Secondary sequence (fūgērunt). The leader was killed BEFORE they fled -> prior action -> Pluperfect Subjunctive."
      },
      {
        "id": "m4-302", "type": "mc", "badge": "SEQUENCE",
        "prompt": "Cum <strong>aeger sit</strong>, domī manet.<br>Why is the subjunctive present?",
        "hint": "manet is present tense (primary).",
        "correct": "Primary sequence, simultaneous action",
        "choices": ["Secondary sequence, simultaneous action", "Primary sequence, prior action", "Primary sequence, simultaneous action", "Secondary sequence, prior action"],
        "explanation": "Primary sequence (manet). He is sick AT THE SAME TIME that he stays home -> simultaneous -> Present Subjunctive."
      },
      {
        "id": "m4-303", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br><em>Since he is working</em>, he does not hear you.<br>Cum ______ (labōrāre), tē nōn audit.",
        "hint": "audit = primary. Simultaneous action = 3rd singular present active subjunctive.",
        "answers": ["laboret"],
        "explanation": "labōret. (Present subjunctive)."
      },
      {
        "id": "m4-304", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br><em>Since he was working</em>, he did not hear you.<br>Cum ______ (labōrāre), tē nōn audīvit.",
        "hint": "audīvit = secondary. Simultaneous action = 3rd singular imperfect active subjunctive.",
        "answers": ["laboraret"],
        "explanation": "labōrāret. (Imperfect subjunctive)."
      },
      {
        "id": "m4-305", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br><em>When they had arrived</em>, we rejoiced.<br>Cum ______ (pervenīre), laetātī sumus.",
        "hint": "laetātī sumus = secondary. Prior action = 3rd plural pluperfect active subjunctive of pervenīre (perf stem: pervēn-).",
        "answers": ["pervenissent"],
        "explanation": "pervēnissent. (Pluperfect subjunctive)."
      },
      {
        "id": "m4-306", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br><em>Since the city had been captured</em>, we fled.<br>Cum urbs ______ (capere), fūgimus.",
        "hint": "fūgimus = secondary. Prior passive action = 3rd singular pluperfect passive subjunctive of capere (PPP = capta).",
        "answers": ["capta esset"],
        "explanation": "capta esset. (Pluperfect passive subjunctive)."
      },

      // --- MIXED TRANSLATION & IDENTIFICATION ---
      {
        "id": "m4-401", "type": "mc", "badge": "MIXED",
        "prompt": "<strong>Cum auxilium petant</strong>, eīs nōn respondēmus.<br>Translate the bolded clause.",
        "hint": "petant = present subjunctive.",
        "correct": "Although/Since they are seeking help",
        "choices": ["When they had sought help", "Although/Since they are seeking help", "With them seeking help", "In order to seek help"],
        "explanation": "Primary sequence, simultaneous action. 'Although/Since they are seeking help, we do not answer them.'"
      },
      {
        "id": "m4-402", "type": "typein", "badge": "MIXED",
        "prompt": "Give the correct Latin for the bolded verb: <br>Although we <strong>are</strong> brave, nevertheless we flee.<br>Cum fortēs ______ (esse), tamen fugimus.",
        "hint": "fugimus = present (primary). Simultaneous = 1st plural present subjunctive of esse.",
        "answers": ["simus"],
        "explanation": "sīmus. (Present subjunctive of esse)."
      },
      {
        "id": "m4-403", "type": "typein", "badge": "MIXED",
        "prompt": "Give the correct Latin for the bolded verb: <br>When he <strong>had seen</strong> the enemy, he shouted.<br>Cum hostem ______ (vidēre), clāmāvit.",
        "hint": "clāmāvit = secondary. Prior = 3rd singular pluperfect active subjunctive of vidēre (perf stem: vīd-).",
        "answers": ["vidisset"],
        "explanation": "vīdisset. (Pluperfect subjunctive)."
      },
      {
        "id": "m4-404", "type": "mc", "badge": "MIXED",
        "prompt": "Cum cīvēs perterritī essent, mīlitēs urbem dēfendēbant.<br>How should <em>cum</em> be translated?",
        "hint": "The citizens being terrified is the reason the soldiers defended the city.",
        "correct": "Since / Because",
        "choices": ["Since / Because", "Although", "With", "In order that"],
        "explanation": "Causal cum clause. 'Since the citizens were terrified...'"
      },
      {
        "id": "m4-405", "type": "mc", "badge": "MIXED",
        "prompt": "What mood is used in a <em>Cum Temporal</em> clause that refers to a purely factual present or future event?",
        "hint": "If it's just stating pure time ('At the exact time when...').",
        "correct": "Indicative",
        "choices": ["Indicative", "Subjunctive", "Infinitive", "Imperative"],
        "explanation": "While circumstantial, causal, and concessive cum clauses use the Subjunctive, a purely temporal cum clause (especially referring to present/future) uses the Indicative."
      },
      {
        "id": "m4-406", "type": "typein", "badge": "FORM",
        "prompt": "Translate the bolded verb: <br>Since the money <strong>has been lost</strong>, we are sad.<br>Cum pecunia ______ (āmittere), tristes sumus.",
        "hint": "sumus = primary. Prior passive action = 3rd singular perfect passive subjunctive of āmittere (PPP = āmissa).",
        "answers": ["amissa sit"],
        "explanation": "āmissa sit. (Perfect passive subjunctive, primary sequence)."
      },
      {
        "id": "m4-407", "type": "typein", "badge": "FORM",
        "prompt": "Translate the bolded verb: <br>Although they <strong>had fought</strong> well, they were killed.<br>Cum bene ______ (pugnāre), interfectī sunt.",
        "hint": "interfectī sunt = secondary. Prior action = 3rd plural pluperfect active subjunctive of pugnāre.",
        "answers": ["pugnavissent"],
        "explanation": "pugnāvissent. (Pluperfect subjunctive)."
      },
      {
        "id": "m4-408", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Cum in forō <strong>ambulārem</strong>, amīcum vīdī.<br>What type of cum clause is this?",
        "hint": "Sets the scene of the action.",
        "correct": "Circumstantial",
        "choices": ["Circumstantial", "Causal", "Concessive", "Temporal"],
        "explanation": "Circumstantial. Uses the imperfect subjunctive to set the background scene. 'When/While I was walking in the forum...'"
      },
      {
        "id": "m4-409", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Cum tē <strong>vidēbō</strong>, fābulam nārrābō.<br>What type of cum clause is this?",
        "hint": "vidēbō is future indicative.",
        "correct": "Temporal",
        "choices": ["Temporal", "Circumstantial", "Causal", "Concessive"],
        "explanation": "Temporal. Because it refers to a purely future time, it uses the indicative (vidēbō), not the subjunctive."
      },
      {
        "id": "m4-410", "type": "typein", "badge": "FORM",
        "prompt": "Translate the bolded verb: <br>When he <strong>heard</strong> this, he departed.<br>Cum hoc ______ (audīre), discessit.",
        "hint": "discessit = secondary. Prior action = 3rd singular pluperfect active subjunctive of audīre.",
        "answers": ["audivisset", "audisset"],
        "explanation": "audīvisset (or the syncopated audisset). Pluperfect subjunctive."
      },
      // Add these to MODULE_DB["cum_clauses"].questions

      {
        "id": "m4-501", "type": "mc", "badge": "CUM INVERSUM",
        "prompt": "Iam lūcēbat, <strong>cum subitō vīdī</strong> hostem.",
        "hint": "The verb 'vīdī' is indicative. This 'flips' the importance.",
        "correct": "It was already day, when suddenly I saw the enemy.",
        "choices": ["Since it was day, I saw the enemy.", "When it was day, I saw the enemy.", "It was already day, when suddenly I saw the enemy.", "Although it was day, I saw the enemy."],
        "explanation": "Cum Inversum: the 'cum' clause uses the indicative to show a sudden, main action interrupting a background state."
      },
      {
        "id": "m4-502", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Which sentence contains a <strong>Causal</strong> cum clause?",
        "hint": "Look for a cause-and-effect relationship.",
        "correct": "Cum sōl occidisset, dormīvimus.",
        "choices": ["Cum amīcīs ambulat.", "Cum sōl occidisset, dormīvimus.", "Cum veniet, eum vidēbō.", "Vesperāscēbat, cum cecidit."],
        "explanation": "Since the sun had set, we slept. The setting of the sun is the reason for the sleeping."
      },
      {
        "id": "m4-503", "type": "typein", "badge": "CONCESSIVE",
        "prompt": "Complete the sentence with the correct subjunctive of <strong>esse</strong>: <br>Cum pauper ______, tamen fēlīx est. (Although he is poor...)",
        "hint": "Primary sequence (est). Needs 3rd person singular present subjunctive.",
        "answers": ["sit"],
        "explanation": "sit. The presence of 'tamen' (nevertheless) proves this is a Concessive cum clause."
      },
      {
        "id": "m4-504", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "In a <strong>Cum Circumstantial</strong> clause, which tense shows an action happening at the <em>same time</em> as a past main verb?",
        "hint": "Secondary sequence + simultaneous time.",
        "correct": "Imperfect Subjunctive",
        "choices": ["Present Subjunctive", "Perfect Subjunctive", "Imperfect Subjunctive", "Pluperfect Subjunctive"],
        "explanation": "Imperfect Subjunctive is used for background actions happening while the main past action occurs."
      },
      {
        "id": "m4-505", "type": "typein", "badge": "FORM",
        "prompt": "Translate the verb: 'When the signal <strong>had been given</strong>...' (signum dare; PPP: datum)",
        "hint": "Secondary sequence, prior passive action. 3rd person singular pluperfect passive subjunctive.",
        "answers": ["signum datum esset", "cum signum datum esset"],
        "explanation": "signum datum esset. (Pluperfect passive = PPP + esset)."
      }

    ]
  },

  "indirect_question": {
    "id": "indirect_question",
    "title": "Indirect Question",
    "badge": "M5",
    "description": "Reported questions. Governed strictly by Sequence of Tenses.",
    "concepts": ["Interrogatives", "SOT Alignment"],
    "questions": [
      // --- INTERROGATIVE TRIGGERS (Vocabulary Check) ---
      {
        "id": "m5-101", "type": "mc", "badge": "TRIGGER",
        "prompt": "Which word means <strong>'why'</strong> and frequently introduces an Indirect Question?",
        "hint": "Three letters, very common.",
        "correct": "cūr",
        "choices": ["quandō", "cūr", "ubi", "unde"],
        "explanation": "'cūr' means 'why'. (quandō = when, ubi = where/when, unde = from where)."
      },
      {
        "id": "m5-102", "type": "mc", "badge": "TRIGGER",
        "prompt": "Which word means <strong>'from where'</strong>?",
        "hint": "Often paired with verbs of motion.",
        "correct": "unde",
        "choices": ["quō", "ubi", "unde", "quandō"],
        "explanation": "'unde' means 'from where'. ('quō' means 'to where', 'ubi' means 'where' or 'when')."
      },
      {
        "id": "m5-103", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "In an Indirect Question, how is the word <strong>num</strong> translated?",
        "hint": "It doesn't expect a 'no' answer here.",
        "correct": "whether",
        "choices": ["surely not", "whether", "now", "never"],
        "explanation": "In direct questions, 'num' expects a 'no' answer. But in an INDIRECT question (e.g., Rogo num veniat), it simply means 'whether' (I ask whether he is coming)."
      },
      {
        "id": "m5-104", "type": "mc", "badge": "TRIGGER",
        "prompt": "Which of the following phrases means <strong>'how great' / 'how large'</strong>?",
        "hint": "Relates to size or magnitude.",
        "correct": "quantus",
        "choices": ["quālis", "quot", "quantus", "quandō"],
        "explanation": "'quantus' means 'how big/great'. ('quālis' = what sort of, 'quot' = how many)."
      },
      {
        "id": "m5-105", "type": "mc", "badge": "TRIGGER",
        "prompt": "Which of the following phrases means <strong>'what sort of' / 'what kind'</strong>?",
        "hint": "Think of the English word 'quality'.",
        "correct": "quālis",
        "choices": ["quālis", "quot", "quantus", "cūr"],
        "explanation": "'quālis' asks about the nature or quality of something."
      },

      // --- IDENTIFICATION & DISCRIMINATION ---
      {
        "id": "m5-201", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Nescio <strong>ubi sit</strong>.<br>What type of clause is bolded?",
        "hint": "ubi = where. 'I do not know where...'",
        "correct": "Indirect Question",
        "choices": ["Indirect Command", "Indirect Question", "Relative Clause", "Purpose Clause"],
        "explanation": "Triggered by a mental action head verb (nescio) and an interrogative word (ubi)."
      },
      {
        "id": "m5-202", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Virum vīdī <strong>quī pūgiōnem tenēbat.</strong><br>What type of clause is bolded?",
        "hint": "Look at the mood of 'tenēbat' (indicative) and what 'quī' is doing.",
        "correct": "Relative Clause",
        "choices": ["Indirect Question", "Relative Clause", "Indirect Command", "Purpose Clause"],
        "explanation": "This is a regular Relative Clause describing the man (indicative verb). 'I saw the man WHO was holding a dagger.'"
      },
      {
        "id": "m5-203", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Mē rogāvit <strong>quis pūgiōnem tenēret.</strong><br>What type of clause is bolded?",
        "hint": "rogāvit = asked. tenēret = subjunctive.",
        "correct": "Indirect Question",
        "choices": ["Indirect Question", "Relative Clause", "Indirect Command", "Result Clause"],
        "explanation": "Indirect Question. Triggered by a head verb (rogāvit) and an interrogative (quis), followed by a subjunctive (tenēret). 'He asked ME WHO was holding the dagger.'"
      },
      {
        "id": "m5-204", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Mīrābāmur <strong>num hostēs fūgissent</strong>.<br>What type of clause is bolded?",
        "hint": "num = whether. mīrābāmur = we were wondering.",
        "correct": "Indirect Question",
        "choices": ["Fear Clause", "Indirect Command", "Indirect Question", "Optative Wish"],
        "explanation": "'We were wondering whether the enemies had fled.' Miror (to wonder) is a head verb."
      },

      // --- SEQUENCE OF TENSES APPLICATIONS ---
      {
        "id": "m5-301", "type": "mc", "badge": "SOT REVIEW",
        "prompt": "Rogat quid heri <strong>fēcerīs</strong>.<br>Why perfect subjunctive?",
        "hint": "Main verb is present. Action is past.",
        "correct": "Primary sequence, prior action",
        "choices": ["Secondary sequence, prior action", "Primary sequence, simultaneous", "Primary sequence, prior action", "Secondary sequence, simultaneous"],
        "explanation": "Rogat = primary. Fēcerīs = happened before the asking. Primary sequence + prior time = Perfect subjunctive."
      },
      {
        "id": "m5-302", "type": "mc", "badge": "SOT REVIEW",
        "prompt": "Rogāvit cūr <strong>lacrimārēs</strong>.<br>Why imperfect subjunctive?",
        "hint": "Main verb is perfect. Action is happening at the same time as the asking.",
        "correct": "Secondary sequence, simultaneous action",
        "choices": ["Primary sequence, simultaneous action", "Secondary sequence, simultaneous action", "Secondary sequence, prior action", "Primary sequence, prior action"],
        "explanation": "Rogāvit = secondary. You were crying AT THE SAME TIME he asked. Secondary + simultaneous = Imperfect subjunctive."
      },
      {
        "id": "m5-303", "type": "mc", "badge": "SOT REVIEW",
        "prompt": "Sciēbam quō <strong>īssent</strong>.<br>Why pluperfect subjunctive?",
        "hint": "Main verb is imperfect. They went there BEFORE he knew about it.",
        "correct": "Secondary sequence, prior action",
        "choices": ["Secondary sequence, prior action", "Secondary sequence, simultaneous action", "Primary sequence, prior action", "Primary sequence, simultaneous action"],
        "explanation": "Sciēbam = secondary. īssent (syncopated from īvissent) = prior action. 'I knew where they HAD gone.'"
      },
      {
        "id": "m5-304", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>I ask what you are saying.<br>Rogō quid ______ (dīcere).",
        "hint": "Rogō = primary. Simultaneous = 2nd person singular present subjunctive.",
        "answers": ["dicas"],
        "explanation": "dīcās. (Primary + simultaneous = present subjunctive)."
      },
      {
        "id": "m5-305", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>I asked what you were saying.<br>Rogāvī quid ______ (dīcere).",
        "hint": "Rogāvī = secondary. Simultaneous = 2nd person singular imperfect subjunctive.",
        "answers": ["diceres"],
        "explanation": "dīcerēs. (Secondary + simultaneous = imperfect subjunctive)."
      },
      {
        "id": "m5-306", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>He knows why they fled.<br>Scit cūr ______ (fugere).",
        "hint": "Scit = primary. Prior = 3rd person plural perfect subjunctive of fugere (perf stem: fūg-).",
        "answers": ["fugerint"],
        "explanation": "fūgerint. (Primary + prior = perfect subjunctive)."
      },
      {
        "id": "m5-307", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>He knew why they had fled.<br>Sciēbat cūr ______ (fugere).",
        "hint": "Sciēbat = secondary. Prior = 3rd person plural pluperfect subjunctive of fugere.",
        "answers": ["fugissent"],
        "explanation": "fūgissent. (Secondary + prior = pluperfect subjunctive)."
      },

      // --- TRANSLATION MATCHING ---
      {
        "id": "m5-401", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Dīc mihi quis sīs.</strong>",
        "hint": "Imperative (Dīc) counts as primary sequence. sīs = present subjunctive.",
        "correct": "Tell me who you are.",
        "choices": ["Tell me who he is.", "Tell me who you were.", "Tell me who you are.", "He told me who you are."],
        "explanation": "'Dīc' is the imperative 'Tell'. 'quis sīs' = 'who you are'."
      },
      {
        "id": "m5-402", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Intellexit quantō in perīculō essēmus.</strong>",
        "hint": "Intellexit = he understood (secondary). essēmus = imperfect subjunctive.",
        "correct": "He understood how great a danger we were in.",
        "choices": ["He understands how great a danger we are in.", "He understood how great a danger we had been in.", "He understood how great a danger we were in.", "We understand how much danger he was in."],
        "explanation": "quantō in perīculō = in how great a danger. essēmus (simultaneous in the past) = we were."
      },
      {
        "id": "m5-403", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Nescīvērunt unde vēnisset.</strong>",
        "hint": "vēnisset = pluperfect subjunctive (prior action).",
        "correct": "They did not know from where he had come.",
        "choices": ["They do not know where he is going.", "They did not know from where he had come.", "They did not know when he came.", "He didn't know where they had come from."],
        "explanation": "unde = from where. vēnisset = he had come."
      },
      {
        "id": "m5-404", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Rogat num hostēs victī sint.</strong>",
        "hint": "victī sint = perfect passive subjunctive (primary sequence, prior action).",
        "correct": "He asks whether the enemies have been conquered.",
        "choices": ["He asked whether the enemies had been conquered.", "He asks whether the enemies are conquering.", "He asks whether the enemies have been conquered.", "He asks why the enemies were conquered."],
        "explanation": "Rogat (present) + victī sint (perfect passive). 'He asks whether they HAVE BEEN conquered.'"
      },

      // --- MIXED TYPE-INS (Production) ---
      {
        "id": "m5-501", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Latin sentence: <br>Tell me what you <strong>have done</strong>.<br>Dīc mihi quid ______ (facere).",
        "hint": "Dīc = primary. Prior action = 2nd person singular perfect active subjunctive.",
        "answers": ["feceris"],
        "explanation": "fēcerīs. (Perfect subjunctive)."
      },
      {
        "id": "m5-502", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Latin sentence: <br>I was wondering where they <strong>were going</strong>.<br>Mīrābar quō ______ (īre).",
        "hint": "Mīrābar = secondary. Simultaneous action = 3rd person plural imperfect active subjunctive of īre (stem is i-).",
        "answers": ["irent"],
        "explanation": "īrent. (Imperfect subjunctive of īre is īre + endings = īrent)."
      },
      {
        "id": "m5-503", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Latin sentence: <br>They ask how many soldiers <strong>are present</strong>.<br>Rogant quot mīlitēs ______ (adesse).",
        "hint": "Rogant = primary. Simultaneous action = 3rd person plural present subjunctive of adesse (ad + esse).",
        "answers": ["adsint"],
        "explanation": "adsint. (Present subjunctive of esse is sim/sis/sit/simus/sitis/sint)."
      },
      {
        "id": "m5-504", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Latin sentence: <br>We didn't know who <strong>had been killed</strong>.<br>Nescīvimus quis ______ (interficere).",
        "hint": "Nescīvimus = secondary. Prior passive action = 3sg pluperfect passive subjunctive of interficere (PPP: interfectus).",
        "answers": ["interfectus esset"],
        "explanation": "interfectus esset. (Pluperfect passive subjunctive)."
      },
      {
        "id": "m5-505", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Latin sentence: <br>I don't know why she <strong>is laughing</strong>.<br>Nesciō cūr ______ (rīdēre).",
        "hint": "Nesciō = primary. Simultaneous = 3rd singular present active subjunctive of rīdēre.",
        "answers": ["rideat"],
        "explanation": "rīdeat. (2nd conjugation takes -eā- in the present subjunctive)."
      },
      // Add to MODULE_DB["indirect_question"].questions

      {
        "id": "m5-601", "type": "mc", "badge": "VOCAB",
        "prompt": "Identify the difference: <strong>Ubi</strong> vs <strong>Quō</strong> vs <strong>Unde</strong>.",
        "hint": "Think of state vs. motion.",
        "correct": "Where (location) / To where / From where",
        "choices": [
          "Where (location) / To where / From where",
          "When / Why / How",
          "Who / What / Which",
          "From where / Where / To where"
        ],
        "explanation": "Latin is very specific about motion. Ubi is 'at' a place; Quō is 'to' a place; Unde is 'from' a place."
      },
      {
        "id": "m5-602", "type": "typein", "badge": "SOT PRODUCTION",
        "prompt": "Translate the verb: 'He asked where we <strong>had been</strong>.' (esse)",
        "hint": "Rogāvit (secondary). Action happened BEFORE the asking (prior).",
        "answers": ["fuissemus"],
        "explanation": "fuissēmus. Secondary sequence + prior action = Pluperfect Subjunctive."
      },
      {
        "id": "m5-603", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "<strong>Rogat quid facias.</strong> vs <strong>Rogat quid feceris.</strong>",
        "hint": "Both are primary sequence (Rogat).",
        "correct": "He asks what you are doing / He asks what you did.",
        "choices": [
          "He asks what you do / He asks what you will do.",
          "He asks what you are doing / He asks what you did.",
          "He asked what you did / He asked what you had done.",
          "He asks why you do it / He asks how you do it."
        ],
        "explanation": "Present subjunctive (faciās) is simultaneous; Perfect subjunctive (fēcerīs) is prior."
      },
      {
        "id": "m5-604", "type": "typein", "badge": "VOCAB",
        "prompt": "Type the Latin word for 'how many' (often used with 'quot' questions).",
        "answers": ["quot"],
        "explanation": "Quot is an indeclinable adjective meaning 'how many'."
      },
      {
        "id": "m5-605", "type": "mc", "badge": "DOUBLE QUESTION",
        "prompt": "<strong>Rogō utrum maneās an abeās.</strong>",
        "hint": "utrum... an... is the formula for double questions.",
        "correct": "I ask whether you are staying or leaving.",
        "choices": [
          "I ask that you stay and not leave.",
          "I ask whether you are staying or leaving.",
          "I ask how you stay and why you leave.",
          "I ask if you can stay or leave."
        ],
        "explanation": "Utrum... an... means 'Whether... or...' in indirect questions."
      },
      {
        "id": "m5-606", "type": "typein", "badge": "FORM",
        "prompt": "Translate the verb: 'I don't know who <strong>is coming</strong>.' (venīre)",
        "hint": "Nesciō (primary). Simultaneous action = 3rd person singular present active subjunctive.",
        "answers": ["veniat"],
        "explanation": "veniat. (Present subjunctive for simultaneous time in primary sequence)."
      }

    ]
  },

  "fear_clauses": {
    "id": "fear_clauses",
    "title": "Fear Clauses",
    "badge": "M6",
    "description": "Verbs of fearing (timeo, vereor, metuo) flip the standard ut/nē logic. This is guaranteed to be on the exam.",
    "concepts": ["Positive Fear", "Negative Fear"],
    "questions": [
      // --- THE "FLIP" (Core Rules) ---
      {
        "id": "m6-101", "type": "mc", "badge": "THE FLIP",
        "prompt": "After a verb of fearing, how is the conjunction <strong>nē</strong> translated?",
        "hint": "It expresses a positive fear (you fear it WILL happen).",
        "correct": "that / lest",
        "choices": ["that... not", "that / lest", "whether", "in order to"],
        "explanation": "With fear clauses, 'nē' means 'that' or 'lest'. Example: Timeō nē pluat = I fear THAT it will rain."
      },
      {
        "id": "m6-102", "type": "mc", "badge": "THE FLIP",
        "prompt": "After a verb of fearing, how is the conjunction <strong>ut</strong> translated?",
        "hint": "It expresses a negative fear (you fear it WON'T happen).",
        "correct": "that... not",
        "choices": ["that", "in order to", "that... not", "lest"],
        "explanation": "With fear clauses, 'ut' (or 'nē nōn') flips to mean 'that... not'. Example: Timeō ut pluat = I fear that it will NOT rain."
      },
      {
        "id": "m6-103", "type": "mc", "badge": "TRIGGER WORD",
        "prompt": "Which of the following is a common <strong>verb of fearing</strong>?",
        "hint": "Deponent verb, 2nd conjugation.",
        "correct": "vereor",
        "choices": ["volō", "vereor", "vetō", "vertō"],
        "explanation": "Vereor (to fear) is a deponent verb that triggers fear clauses. Timeō and metuō are the other common ones."
      },
      {
        "id": "m6-104", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Which conjunction can be used interchangeably with <strong>ut</strong> in a fear clause?",
        "hint": "A double negative.",
        "correct": "nē nōn",
        "choices": ["ut nōn", "nē nōn", "num", "quīn"],
        "explanation": "In fear clauses, 'ut' means 'that not'. You can also use 'nē nōn' to mean the exact same thing."
      },

      // --- TRANSLATION MATCHING ---
      {
        "id": "m6-201", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Timeō nē hostēs veniant.</strong>",
        "hint": "nē = that.",
        "correct": "I fear that the enemies are coming.",
        "choices": ["I fear that the enemies are not coming.", "I fear that the enemies are coming.", "I feared lest the enemies come.", "They fear that the enemies are coming."],
        "explanation": "Timeō = I fear. nē = that. veniant = they are coming."
      },
      {
        "id": "m6-202", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Metuēbam ut mīlitēs pugnārent.</strong>",
        "hint": "Metuēbam = I was fearing. ut = that... not.",
        "correct": "I was fearing that the soldiers would not fight.",
        "choices": ["I was fearing that the soldiers were fighting.", "I am fearing that the soldiers will not fight.", "I was fearing that the soldiers would not fight.", "I fear lest the soldiers fight."],
        "explanation": "ut flips to 'that not'. Imperfect subjunctive (pugnārent) shows simultaneous/subsequent action in secondary sequence."
      },
      {
        "id": "m6-203", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Verita est nē urbs capta esset.</strong>",
        "hint": "Verita est = She feared. capta esset = pluperfect passive subjunctive.",
        "correct": "She feared that the city had been captured.",
        "choices": ["She fears that the city is being captured.", "She feared that the city had been captured.", "She feared that the city had not been captured.", "She feared to capture the city."],
        "explanation": "nē = that. capta esset = had been captured (prior time in secondary sequence)."
      },
      {
        "id": "m6-204", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Timēmus nē nōn vincāmus.</strong>",
        "hint": "nē nōn = that... not. vincāmus = present subjunctive.",
        "correct": "We fear that we will not win.",
        "choices": ["We fear that we will win.", "We fear lest we win.", "We feared that we would not win.", "We fear that we will not win."],
        "explanation": "nē nōn is used just like ut in fear clauses."
      },

      // --- SEQUENCE OF TENSES APPLICATIONS ---
      {
        "id": "m6-301", "type": "mc", "badge": "SEQUENCE",
        "prompt": "Timeō nē amīcus <strong>ēgrediātur</strong>.<br>Why is the subjunctive present tense?",
        "hint": "Look at Timeō.",
        "correct": "Primary sequence, simultaneous/subsequent action",
        "choices": ["Secondary sequence, simultaneous action", "Primary sequence, simultaneous/subsequent action", "Primary sequence, prior action", "Secondary sequence, prior action"],
        "explanation": "Timeō (present = primary sequence). ēgrediātur (present subjunctive) shows the fear is happening at the same time or right after the fearing."
      },
      {
        "id": "m6-302", "type": "mc", "badge": "SEQUENCE",
        "prompt": "Metuēbat nē rēx <strong>interfectus esset</strong>.<br>Why is the subjunctive pluperfect?",
        "hint": "Metuēbat = secondary sequence.",
        "correct": "Secondary sequence, prior action",
        "choices": ["Secondary sequence, prior action", "Primary sequence, prior action", "Secondary sequence, simultaneous action", "Primary sequence, simultaneous action"],
        "explanation": "Metuēbat (imperfect = secondary). He feared that the king HAD ALREADY BEEN killed (prior action)."
      },

      // --- TYPE-IN (Production) ---
      {
        "id": "m6-401", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>I fear that he <strong>is falling</strong>.<br>Timeō nē ______ (cadere).",
        "hint": "Primary + simultaneous = 3rd singular present active subjunctive.",
        "answers": ["cadat"],
        "explanation": "cadat. (Present subjunctive of cadere)."
      },
      {
        "id": "m6-402", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>I was fearing that he <strong>was falling</strong>.<br>Timēbam nē ______ (cadere).",
        "hint": "Secondary + simultaneous = 3rd singular imperfect active subjunctive.",
        "answers": ["caderet"],
        "explanation": "caderet. (Imperfect subjunctive of cadere)."
      },
      {
        "id": "m6-403", "type": "typein", "badge": "NEGATIVE",
        "prompt": "Fill in the blank with the correct conjunction: <br>He fears that the ships will <strong>not</strong> arrive.<br>Metuit ______ nāvēs perveniant.",
        "hint": "Negative fear. Two-letter word.",
        "answers": ["ut"],
        "explanation": "ut. (You could also use 'nē nōn', but 'ut' is standard)."
      },
      {
        "id": "m6-404", "type": "typein", "badge": "NEGATIVE",
        "prompt": "Fill in the blank with the correct conjunction: <br>We feared that the war <strong>would</strong> happen.<br>Veritī sumus ______ bellum accideret.",
        "hint": "Positive fear.",
        "answers": ["ne"],
        "explanation": "nē. (We fear THAT it will happen)."
      },
      {
        "id": "m6-405", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>She fears that the money <strong>has been lost</strong>.<br>Verētur nē pecūnia ______ (āmittere).",
        "hint": "Primary sequence. Prior passive action = 3rd singular perfect passive subjunctive (PPP = āmissa).",
        "answers": ["amissa sit"],
        "explanation": "āmissa sit. (Perfect passive subjunctive)."
      },
      {
        "id": "m6-406", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>We feared that they <strong>had spoken</strong>. (loquī - deponent)<br>Timuimus nē ______.",
        "hint": "Secondary sequence. Prior action = 3rd plural pluperfect subjunctive of a deponent (PPP = locūtī).",
        "answers": ["locuti essent"],
        "explanation": "locūtī essent. (Pluperfect subjunctive of a deponent verb)."
      },
      {
        "id": "m6-407", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>I fear that you <strong>are not listening</strong>.<br>Timeō ut ______ (audīre).",
        "hint": "Primary sequence. Simultaneous action = 2nd singular present active subjunctive.",
        "answers": ["audias"],
        "explanation": "audiās. ('ut' handles the 'not', so just conjugate audīre normally)."
      },
      {
        "id": "m6-408", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>They feared that the city <strong>was being attacked</strong>.<br>Metuēbant nē urbs ______ (oppugnāre).",
        "hint": "Secondary sequence. Simultaneous PASSIVE action = 3rd singular imperfect passive subjunctive.",
        "answers": ["oppugnaretur"],
        "explanation": "oppugnārētur. (Imperfect passive subjunctive)."
      },
      {
        "id": "m6-409", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Read the sentence: <strong>Veritus est cūr nēmō adesset.</strong><br>What type of clause is this?",
        "hint": "Look at the trigger word 'cūr'.",
        "correct": "Indirect Question",
        "choices": ["Fear Clause", "Indirect Question", "Purpose Clause", "Result Clause"],
        "explanation": "This is a trap! Even though 'veritus est' (he feared) is the main verb, it is followed by an interrogative word (cūr = why). 'He feared why no one was present.' If it were a Fear Clause, it would use nē or ut."
      },
      {
        "id": "m6-410", "type": "typein", "badge": "FORM",
        "prompt": "Type the correct Latin verb to fit the sequence: <br>I fear that they <strong>will capture</strong> the camp.<br>Timeō nē castra ______ (capere).",
        "hint": "Primary sequence. Latin doesn't have a future subjunctive, so it uses the present for subsequent action. 3rd plural present active subjunctive.",
        "answers": ["capiant"],
        "explanation": "capiant. (Present subjunctive covers both simultaneous and subsequent action in primary sequence)."
      },
      // Add to MODULE_DB["fear_clauses"].questions

      {
        "id": "m6-601", "type": "mc", "badge": "THE FLIP",
        "prompt": "<strong>Timeō nē cadās.</strong>",
        "hint": "In fear clauses, 'nē' is what you DON'T want to happen.",
        "correct": "I fear that you are falling.",
        "choices": ["I fear that you are falling.", "I fear that you are not falling.", "I fear lest you didn't fall.", "I am afraid to fall."],
        "explanation": "Fear Clauses flip the usual logic: nē = that/lest; ut = that... not."
      },
      {
        "id": "m6-602", "type": "mc", "badge": "THE FLIP",
        "prompt": "<strong>Timeō ut veniat.</strong>",
        "hint": "In fear clauses, 'ut' is the desired outcome you're afraid won't happen.",
        "correct": "I fear that he is not coming.",
        "choices": ["I fear that he is coming.", "I fear that he is not coming.", "I am afraid when he comes.", "I fear for his coming."],
        "explanation": "Ut in a fear clause means 'that... not'."
      },
      {
        "id": "m6-603", "type": "typein", "badge": "SYNONYM",
        "prompt": "What two-word phrase is a synonym for <strong>ut</strong> in a fear clause?",
        "hint": "nē + ____",
        "answers": ["ne non"],
        "explanation": "nē nōn. 'Timeō nē nōn veniat' is the same as 'Timeō ut veniat'."
      },
      {
        "id": "m6-604", "type": "mc", "badge": "SOT",
        "prompt": "<strong>Veritus sum nē hostēs venīrent.</strong>",
        "hint": "Veritus sum is perfect (secondary).",
        "correct": "I feared that the enemies were coming.",
        "choices": ["I fear that the enemies come.", "I feared that the enemies were coming.", "I feared that the enemies had come.", "I was afraid of the enemies coming."],
        "explanation": "Secondary sequence + simultaneous action = Imperfect Subjunctive."
      },
      {
        "id": "m6-605", "type": "typein", "badge": "FORM",
        "prompt": "Translate: 'We fear that the city <strong>has been</strong> captured.' (capere; PPP: capta)",
        "hint": "Primary sequence (Fear = Present). Prior passive action = Perfect Passive Subjunctive.",
        "answers": ["ne urbs capta sit"],
        "explanation": "nē urbs capta sit. (Fear clauses use nē for 'that')."
      },
      {
        "id": "m6-606", "type": "mc", "badge": "VOCAB",
        "prompt": "Which of these is NOT a verb of fearing?",
        "hint": "One is a verb of 'forbidding'.",
        "correct": "vetō",
        "choices": ["metuō", "vereor", "timeō", "vetō"],
        "explanation": "Vetō means 'I forbid'. The others all mean 'I fear'."
      },
      {
        "id": "m6-607", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "<strong>Verēmur nē hostēs castra capiant.</strong> <br>How is 'capiant' functioning here?",
        "hint": "Latin lacks a future subjunctive.",
        "correct": "Present subjunctive used for future time",
        "choices": ["Present subjunctive used for future time", "Present subjunctive used for past time", "Perfect subjunctive used for future time", "It is an indicative verb"],
        "explanation": "Since fears are usually about the future, the present subjunctive in primary sequence often carries a future meaning."
      }

    ]
  },

  "conditionals": {
    "id": "conditionals",
    "title": "Conditionals",
    "badge": "M7",
    "description": "If/Then statements. Three types use the Indicative (Simple), but three types use the Subjunctive. Know the formulas.",
    "concepts": ["Future Less Vivid", "Present CTF", "Past CTF"],
    "questions": [
      // --- PART 1: THE FORMULAS (Memorization) ---
      {
        "id": "m7-101", "type": "mc", "badge": "FORMULA",
        "prompt": "Which conditional uses the <strong>Present Subjunctive</strong> in both clauses?",
        "hint": "Should... would...",
        "correct": "Future Less Vivid",
        "choices": ["Present Contrary to Fact", "Future More Vivid", "Future Less Vivid", "Past Contrary to Fact"],
        "explanation": "Future Less Vivid (Should/Would) uses Present Subjunctive. Sī adsit, bene sit. (If he should be present, it would be well.)"
      },
      {
        "id": "m7-102", "type": "mc", "badge": "FORMULA",
        "prompt": "Which conditional uses the <strong>Imperfect Subjunctive</strong> in both clauses?",
        "hint": "Were... would...",
        "correct": "Present Contrary to Fact",
        "choices": ["Present Contrary to Fact", "Future More Vivid", "Future Less Vivid", "Past Contrary to Fact"],
        "explanation": "Present CTF (Were/Would) uses Imperfect Subjunctive. Sī adesset, bene esset. (If he were present [but he's not], it would be well.)"
      },
      {
        "id": "m7-103", "type": "mc", "badge": "FORMULA",
        "prompt": "Which conditional uses the <strong>Pluperfect Subjunctive</strong> in both clauses?",
        "hint": "Had... would have...",
        "correct": "Past Contrary to Fact",
        "choices": ["Present Contrary to Fact", "Future More Vivid", "Future Less Vivid", "Past Contrary to Fact"],
        "explanation": "Past CTF (Had/Would have) uses Pluperfect Subjunctive. Sī adfuisset, bene fuisset. (If he had been present, it would have been well.)"
      },
      {
        "id": "m7-104", "type": "mc", "badge": "FORMULA",
        "prompt": "Which conditional uses the <strong>Future Indicative</strong> (or Future Perfect) in the 'If' clause and Future Indicative in the main clause?",
        "hint": "Does/Will... will...",
        "correct": "Future More Vivid",
        "choices": ["Present Contrary to Fact", "Future More Vivid", "Future Less Vivid", "Simple Present"],
        "explanation": "Future More Vivid (Does/Will... will) uses the Future or Future Perfect Indicative. Sī aderit, bene erit. (If he is present, it will be well.)"
      },
      {
        "id": "m7-105", "type": "mc", "badge": "FORMULA",
        "prompt": "Which conditional uses the <strong>Present Indicative</strong> in both clauses?",
        "hint": "Does... is...",
        "correct": "Simple Present",
        "choices": ["Present Contrary to Fact", "Future More Vivid", "Future Less Vivid", "Simple Present"],
        "explanation": "Simple Present Conditionals state a simple fact using the present indicative. Sī adest, bene est. (If he is present, it is well.)"
      },

      // --- PART 2: IDENTIFYING THE CONDITIONAL ---
      {
        "id": "m7-201", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Identify the conditional: <strong>Sī hoc dīcat, erret.</strong>",
        "hint": "dīcat / erret = present subjunctives.",
        "correct": "Future Less Vivid",
        "choices": ["Future Less Vivid", "Present CTF", "Future More Vivid", "Past CTF"],
        "explanation": "Present subjunctive = Future Less Vivid. 'If he should say this, he would be wrong.'"
      },
      {
        "id": "m7-202", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Identify the conditional: <strong>Sī hoc dīxisset, errāvisset.</strong>",
        "hint": "dīxisset / errāvisset = pluperfect subjunctives.",
        "correct": "Past CTF",
        "choices": ["Future Less Vivid", "Present CTF", "Future More Vivid", "Past CTF"],
        "explanation": "Pluperfect subjunctive = Past Contrary to Fact. 'If he had said this, he would have been wrong.'"
      },
      {
        "id": "m7-203", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Identify the conditional: <strong>Sī hoc dīcet, errābit.</strong>",
        "hint": "dīcet / errābit = future indicatives.",
        "correct": "Future More Vivid",
        "choices": ["Future Less Vivid", "Present CTF", "Future More Vivid", "Simple Fact Present"],
        "explanation": "Future indicative = Future More Vivid. 'If he says (will say) this, he will be wrong.'"
      },
      {
        "id": "m7-204", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Identify the conditional: <strong>Sī hoc dīceret, errāret.</strong>",
        "hint": "dīceret / errāret = imperfect subjunctives.",
        "correct": "Present CTF",
        "choices": ["Future Less Vivid", "Present CTF", "Past CTF", "Simple Fact Past"],
        "explanation": "Imperfect subjunctive = Present Contrary to Fact. 'If he were saying this, he would be wrong.'"
      },
      {
        "id": "m7-205", "type": "mc", "badge": "IDENTIFY",
        "prompt": "Identify the conditional: <strong>Sī pacem petunt, eīs damus.</strong>",
        "hint": "petunt / damus = present indicatives.",
        "correct": "Simple Present",
        "choices": ["Simple Present", "Future Less Vivid", "Present CTF", "Future More Vivid"],
        "explanation": "Present indicative = Simple Present (Fact). 'If they seek peace, we give it to them.'"
      },

      // --- PART 3: TRANSLATION MATCHING ---
      {
        "id": "m7-301", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Sī mīlitēs pugnāvissent, vīcissēmus.</strong>",
        "hint": "Past CTF (pluperfect subj).",
        "correct": "If the soldiers had fought, we would have won.",
        "choices": ["If the soldiers fight, we will win.", "If the soldiers should fight, we would win.", "If the soldiers were fighting, we would be winning.", "If the soldiers had fought, we would have won."],
        "explanation": "Pluperfect subj = Past CTF. 'Had... would have...'"
      },
      {
        "id": "m7-302", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Sī mīlitēs pugnent, vincāmus.</strong>",
        "hint": "Future Less Vivid (present subj).",
        "correct": "If the soldiers should fight, we would win.",
        "choices": ["If the soldiers fight, we will win.", "If the soldiers should fight, we would win.", "If the soldiers were fighting, we would be winning.", "If the soldiers had fought, we would have won."],
        "explanation": "Present subj = FLV. 'Should... would...'"
      },
      {
        "id": "m7-303", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Sī mīlitēs pugnārent, vincerēmus.</strong>",
        "hint": "Present CTF (imperfect subj).",
        "correct": "If the soldiers were fighting, we would be winning.",
        "choices": ["If the soldiers fight, we will win.", "If the soldiers should fight, we would win.", "If the soldiers were fighting, we would be winning.", "If the soldiers had fought, we would have won."],
        "explanation": "Imperfect subj = Present CTF. 'Were... would...'"
      },
      {
        "id": "m7-304", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Sī Caesar adest, tūtī sumus.</strong>",
        "hint": "Simple Present (present ind).",
        "correct": "If Caesar is present, we are safe.",
        "choices": ["If Caesar will be present, we will be safe.", "If Caesar should be present, we would be safe.", "If Caesar is present, we are safe.", "If Caesar were present, we would be safe."],
        "explanation": "Present indicative = Simple fact. 'If [fact], [fact].'"
      },
      {
        "id": "m7-305", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Sī dīligenter studuerit, exāmen trānsībit.</strong>",
        "hint": "Future More Vivid. studuerit is future perfect indicative.",
        "correct": "If he studies diligently, he will pass the exam.",
        "choices": ["If he should study diligently, he would pass the exam.", "If he studies diligently, he will pass the exam.", "If he were studying diligently, he would pass the exam.", "If he had studied diligently, he would have passed the exam."],
        "explanation": "Future More Vivid often uses the Future Perfect Indicative in the 'If' clause to show the action must be completed before the main future action."
      },

      // --- PART 4: TYPE-IN (Production & Conjugation) ---
      {
        "id": "m7-401", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Future Less Vivid conditional: <br>If he <strong>should come</strong>, we would be happy.<br>Sī ______ (venīre), laetī sīmus.",
        "hint": "Needs 3rd person singular present active subjunctive.",
        "answers": ["veniat"],
        "explanation": "veniat. (FLV uses present subjunctive)."
      },
      {
        "id": "m7-402", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Present CTF conditional: <br>If he <strong>were coming</strong>, we would be happy.<br>Sī ______ (venīre), laetī essēmus.",
        "hint": "Needs 3rd person singular imperfect active subjunctive.",
        "answers": ["veniret"],
        "explanation": "venīret. (Present CTF uses imperfect subjunctive)."
      },
      {
        "id": "m7-403", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Past CTF conditional: <br>If he <strong>had come</strong>, we would have been happy.<br>Sī ______ (venīre), laetī fuissēmus.",
        "hint": "Needs 3rd person singular pluperfect active subjunctive of venīre (perf stem: vēn-).",
        "answers": ["venisset"],
        "explanation": "vēnisset. (Past CTF uses pluperfect subjunctive)."
      },
      {
        "id": "m7-404", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Future More Vivid conditional: <br>If he comes, we <strong>will be</strong> happy.<br>Sī veniet, laetī ______ (esse).",
        "hint": "Needs 1st person plural future indicative of esse.",
        "answers": ["erimus"],
        "explanation": "erimus. (FMV uses future indicative)."
      },
      {
        "id": "m7-405", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Future Less Vivid conditional: <br>If they should attack, we <strong>would defend</strong> the city.<br>Sī oppugnent, urbem ______ (dēfendere).",
        "hint": "Needs 1st person plural present active subjunctive of dēfendere.",
        "answers": ["defendamus"],
        "explanation": "dēfendāmus. (FLV uses present subjunctive in both clauses)."
      },
      {
        "id": "m7-406", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Past CTF conditional: <br>If the money had been lost, they <strong>would have wept</strong>.<br>Sī pecūnia āmissa esset, ______ (flēre).",
        "hint": "Needs 3rd person plural pluperfect active subjunctive of flēre (perf stem: flēv-).",
        "answers": ["flevissent"],
        "explanation": "flēvissent. (Past CTF uses pluperfect subjunctive in both clauses)."
      },
      {
        "id": "m7-407", "type": "typein", "badge": "NEGATIVE",
        "prompt": "Fill in the blank with the correct negative: <br>If you do <strong>not</strong> study, you will fail.<br>Sī ______ studēbis, dēficiēs.",
        "hint": "Conditionals (unlike purpose or fear clauses) just use the standard Latin word for 'not'.",
        "answers": ["non"],
        "explanation": "nōn. (If clauses use nōn for negation, or 'nisi' for 'if not/unless')."
      },
      {
        "id": "m7-408", "type": "typein", "badge": "NEGATIVE",
        "prompt": "Fill in the blank with the word that means 'unless' or 'if... not':<br>______ currēs, capiēris.<br>Unless you run, you will be captured.",
        "hint": "Four letters.",
        "answers": ["nisi"],
        "explanation": "nisi = unless / if not."
      },

      // --- PART 5: MIXED CONDITIONS & EXAM TRAPS ---
      {
        "id": "m7-501", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Identify this conditional: <strong>Sī heri studuissēs, hodiē exāmen trānsīrēs.</strong>",
        "hint": "studuissēs = pluperfect. trānsīrēs = imperfect.",
        "correct": "Mixed Contrary to Fact",
        "choices": ["Past CTF", "Present CTF", "Mixed Contrary to Fact", "Future Less Vivid"],
        "explanation": "This is a Mixed CTF. 'If you HAD studied yesterday (Past CTF), you WOULD BE passing the exam today (Present CTF).'"
      },
      {
        "id": "m7-502", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate the Mixed CTF: <strong>Sī Rōmānī Carthāginem nōn dēlēvissent, Carthāgō nunc flōrēret.</strong>",
        "hint": "dēlēvissent = past. flōrēret = present.",
        "correct": "If the Romans had not destroyed Carthage, Carthage would be flourishing now.",
        "choices": ["If the Romans do not destroy Carthage, it will flourish now.", "If the Romans had not destroyed Carthage, it would have flourished.", "If the Romans had not destroyed Carthage, Carthage would be flourishing now.", "If the Romans should not destroy Carthage, it would flourish."],
        "explanation": "Pluperfect subjunctive in the protasis (had not destroyed) + Imperfect subjunctive in the apodosis (would be flourishing now)."
      },
      {
        "id": "m7-503", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Mixed CTF conditional: <br>If he <strong>had not departed</strong> yesterday, he would be here today.<br>Sī heri nōn ______ (discēdere), hodiē adesset.",
        "hint": "Needs 3rd person singular pluperfect active subjunctive of discēdere (perf stem: discess-).",
        "answers": ["discessisset"],
        "explanation": "discessisset. (Past CTF half of the mixed conditional)."
      },
      {
        "id": "m7-504", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Mixed CTF conditional: <br>If he had not departed yesterday, he <strong>would be</strong> here today.<br>Sī heri nōn discessisset, hodiē ______ (adesse).",
        "hint": "Needs 3rd person singular imperfect subjunctive of adesse.",
        "answers": ["adesset"],
        "explanation": "adesset. (Present CTF half of the mixed conditional)."
      },
      {
        "id": "m7-505", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Which of these pairs represents the correct tenses for a <strong>Future More Vivid</strong> conditional?",
        "hint": "Indicatives only.",
        "correct": "Future Indicative / Future Indicative",
        "choices": ["Present Subjunctive / Present Subjunctive", "Future Indicative / Future Indicative", "Imperfect Subjunctive / Imperfect Subjunctive", "Present Indicative / Present Subjunctive"],
        "explanation": "Future More Vivid uses Future (or Future Perfect) indicative in both halves."
      },
      {
        "id": "m7-506", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Translate: <strong>Nisi venīrēs, trīstis essem.</strong>",
        "hint": "Nisi = if not / unless. venīrēs / essem = imperfect subjunctives.",
        "correct": "Unless you were coming, I would be sad.",
        "choices": ["Unless you come, I will be sad.", "Unless you had come, I would have been sad.", "Unless you should come, I would be sad.", "Unless you were coming, I would be sad."],
        "explanation": "Imperfect subjunctives = Present CTF. 'If you were not coming (Unless you were coming)...'"
      },
      {
        "id": "m7-507", "type": "mc", "badge": "RULE",
        "prompt": "What is the technical grammatical term for the <strong>'If'</strong> clause in a conditional sentence?",
        "hint": "Starts with 'P'.",
        "correct": "Protasis",
        "choices": ["Apodosis", "Protasis", "Ablative Absolute", "Periphrastic"],
        "explanation": "The 'If' clause is the Protasis. The 'Then' clause (the main conclusion) is the Apodosis."
      },
      // Add these to MODULE_DB["conditionals"].questions

      {
        "id": "m7-601", "type": "mc", "badge": "SIMPLE PAST",
        "prompt": "Identify: <strong>Sī amāvit, vīcit.</strong>",
        "hint": "Both verbs are perfect indicative.",
        "correct": "Simple Fact Past",
        "choices": ["Past Contrary to Fact", "Simple Fact Past", "Future Less Vivid", "Mixed Conditional"],
        "explanation": "Indicatives = Simple Fact. Since they are perfect, it is a simple past condition."
      },
      {
        "id": "m7-602", "type": "mc", "badge": "MIXED CTF",
        "prompt": "<strong>Sī heri studuissēs, hodiē sapiēns essēs.</strong>",
        "hint": "studuissēs (pluperfect) + essēs (imperfect).",
        "correct": "If you had studied yesterday, you would be wise today.",
        "choices": ["If you studied yesterday, you were wise today.", "If you should study, you would be wise.", "If you had studied yesterday, you would be wise today.", "If you were studying, you would have been wise."],
        "explanation": "Mixed CTF: Pluperfect (past condition) + Imperfect (present result)."
      },
      {
        "id": "m7-603", "type": "typein", "badge": "FORM",
        "prompt": "Turn this into a <strong>Future Less Vivid</strong>: <br>Sī veniet (will come), gaudēbimus (will rejoice).",
        "hint": "Change both future indicatives to present subjunctives.",
        "answers": ["si veniat gaudeamus"],
        "explanation": "Sī veniat, gaudeāmus. (Should come... would rejoice)."
      }

    ]
  },

  "quin_clauses": {
    "id": "quin_clauses",
    "title": "Quin Clauses",
    "badge": "M8",
    "description": "Doubting and Preventing. A staple of advanced grammar.",
    "concepts": ["Doubting", "Preventing"],
    "questions": [
      // --- PART 1: RULES & TRIGGERS ---
      {
        "id": "m8-101", "type": "mc", "badge": "TRIGGER WORD",
        "prompt": "Which of these phrases is a classic trigger for a <strong>quīn</strong> clause?",
        "hint": "Requires a negative + a word of doubting.",
        "correct": "nōn dubitō",
        "choices": ["dubitō", "nōn dubitō", "rogō", "sciō"],
        "explanation": "A positive 'dubitō' (I doubt) usually takes an indirect question with 'an' or 'num'. It must be NEGATED ('nōn dubitō' or 'nēmō dubitat') to trigger 'quīn'."
      },
      {
        "id": "m8-102", "type": "mc", "badge": "TRIGGER WORD",
        "prompt": "Which of these verbs of <strong>preventing or hindering</strong> triggers a quīn clause?",
        "hint": "Means 'to hinder/impede'.",
        "correct": "impediō",
        "choices": ["imperō", "impediō", "incipiō", "intellegō"],
        "explanation": "Verbs of preventing, hindering, or deterring (impediō, dēterreō, retineō, obstō) trigger quīn or quōminus clauses."
      },
      {
        "id": "m8-103", "type": "mc", "badge": "TRANSLATION RULE",
        "prompt": "After a negated word of <strong>doubting</strong> (e.g., nōn dubitō), how is <em>quīn</em> translated?",
        "hint": "I do not doubt _____ you are right.",
        "correct": "that",
        "choices": ["who", "from", "that", "lest"],
        "explanation": "After 'nōn dubitō', quīn simply means 'that'. (I do not doubt THAT...)"
      },
      {
        "id": "m8-104", "type": "mc", "badge": "TRANSLATION RULE",
        "prompt": "After a verb of <strong>preventing or hindering</strong>, how is <em>quīn</em> translated?",
        "hint": "Nothing prevents me _____ doing this.",
        "correct": "from",
        "choices": ["who", "from", "that", "lest"],
        "explanation": "After words of hindering, quīn (or quōminus) is translated as 'from [verb]ing'. (Nothing prevents us FROM leaving)."
      },

      // --- PART 2: TRANSLATION MATCHING ---
      {
        "id": "m8-201", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Nōn dubitō quīn Rōma magna sit.</strong>",
        "hint": "sit = present subjunctive (simultaneous).",
        "correct": "I do not doubt that Rome is great.",
        "choices": ["I doubt that Rome is great.", "I do not doubt that Rome is great.", "I do not doubt that Rome was great.", "Rome is great without a doubt."],
        "explanation": "Nōn dubitō = I do not doubt. quīn = that. sit = is."
      },
      {
        "id": "m8-202", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Nēmō dubitābat quīn hostēs fūgissent.</strong>",
        "hint": "Nēmō dubitābat = No one was doubting. fūgissent = pluperfect subjunctive.",
        "correct": "No one was doubting that the enemies had fled.",
        "choices": ["No one doubts that the enemies have fled.", "No one was doubting that the enemies were fleeing.", "No one was doubting that the enemies had fled.", "No one doubts from where the enemies fled."],
        "explanation": "Secondary sequence (dubitābat) + prior action (fūgissent). 'No one was doubting that they HAD fled.'"
      },
      {
        "id": "m8-203", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Nihil nōs impedit quīn discēdāmus.</strong>",
        "hint": "impedit = prevents. discēdāmus = we depart.",
        "correct": "Nothing prevents us from departing.",
        "choices": ["Nothing prevents us from departing.", "Nothing doubts that we are departing.", "We prevent nothing from departing.", "He prevents us from departing."],
        "explanation": "Nihil impedit = Nothing prevents. quīn discēdāmus = from departing."
      },
      {
        "id": "m8-204", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Mīlitēs dēterrēbīmus quīn pugnent.</strong>",
        "hint": "dēterrēbīmus = we will deter. pugnent = they fight.",
        "correct": "We will deter the soldiers from fighting.",
        "choices": ["We will deter the soldiers from fighting.", "We deter the soldiers from fighting.", "We did not doubt that the soldiers fought.", "We will order the soldiers not to fight."],
        "explanation": "dēterreō is a verb of preventing. quīn = from [verb]ing."
      },

      // --- PART 3: IDENTIFICATION & DISCRIMINATION ---
      {
        "id": "m8-301", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Identify the clause: <strong>Quis dubitat quīn dī immortālēs adsint?</strong>",
        "hint": "Quis dubitat? = Who doubts? (This is a rhetorical question implying 'No one doubts').",
        "correct": "Quin Clause",
        "choices": ["Indirect Question", "Quin Clause", "Purpose Clause", "Result Clause"],
        "explanation": "A rhetorical question like 'Quis dubitat?' acts as a negated doubting expression, triggering a quīn clause."
      },
      {
        "id": "m8-302", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Identify the clause: <strong>Dubitō num hostēs veniant.</strong>",
        "hint": "Positive doubting uses num or an.",
        "correct": "Indirect Question",
        "choices": ["Indirect Question", "Quin Clause", "Indirect Command", "Fear Clause"],
        "explanation": "Because 'Dubitō' is NOT negated here, it takes an Indirect Question with 'num' or 'an' (I doubt whether the enemies are coming)."
      },
      {
        "id": "m8-303", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Which of the following phrases is frequently paired with a quīn clause?",
        "hint": "Means 'it cannot be but that...'",
        "correct": "Fierī nōn potest quīn",
        "choices": ["Ita accidit ut", "Fierī nōn potest quīn", "Tantus erat ut", "Imperāvit eīs ut"],
        "explanation": "Fierī nōn potest quīn (It is not possible that... not / It cannot be but that...) is a set idiom that always triggers a quīn clause."
      },

      // --- PART 4: TYPE-IN (Conjugation & Production) ---
      {
        "id": "m8-401", "type": "typein", "badge": "FORM",
        "prompt": "Complete the quīn clause: <br>I do not doubt that he <strong>is working</strong>.<br>Nōn dubitō quīn ______ (labōrāre).",
        "hint": "Primary sequence. Simultaneous action = 3rd person singular present active subjunctive.",
        "answers": ["laboret"],
        "explanation": "labōret. (Present subjunctive)."
      },
      {
        "id": "m8-402", "type": "typein", "badge": "FORM",
        "prompt": "Complete the quīn clause: <br>I did not doubt that he <strong>was working</strong>.<br>Nōn dubitāvī quīn ______ (labōrāre).",
        "hint": "Secondary sequence. Simultaneous action = 3rd person singular imperfect active subjunctive.",
        "answers": ["laboraret"],
        "explanation": "labōrāret. (Imperfect subjunctive)."
      },
      {
        "id": "m8-403", "type": "typein", "badge": "FORM",
        "prompt": "Complete the quīn clause: <br>I do not doubt that they <strong>have fled</strong>.<br>Nōn dubitō quīn ______ (fugere).",
        "hint": "Primary sequence. Prior action = 3rd plural perfect active subjunctive of fugere (perf stem: fūg-).",
        "answers": ["fugerint"],
        "explanation": "fūgerint. (Perfect subjunctive)."
      },
      {
        "id": "m8-404", "type": "typein", "badge": "FORM",
        "prompt": "Complete the quīn clause: <br>I did not doubt that they <strong>had fled</strong>.<br>Nōn dubitāvī quīn ______ (fugere).",
        "hint": "Secondary sequence. Prior action = 3rd plural pluperfect active subjunctive of fugere.",
        "answers": ["fugissent"],
        "explanation": "fūgissent. (Pluperfect subjunctive)."
      },
      {
        "id": "m8-405", "type": "typein", "badge": "FORM",
        "prompt": "Complete the quīn clause: <br>They deter him from <strong>speaking</strong>.<br>Eum dēterrent quīn ______ (dīcere).",
        "hint": "Primary sequence. Simultaneous action = 3rd singular present active subjunctive.",
        "answers": ["dicat"],
        "explanation": "dīcat. (Present subjunctive of 3rd conjugation dīcere)."
      },
      {
        "id": "m8-406", "type": "typein", "badge": "FORM",
        "prompt": "Complete the quīn clause: <br>They deterred him from <strong>speaking</strong>.<br>Eum dēterruērunt quīn ______ (dīcere).",
        "hint": "Secondary sequence (dēterruērunt = perfect). Simultaneous action = 3rd singular imperfect active subjunctive.",
        "answers": ["diceret"],
        "explanation": "dīceret. (Imperfect subjunctive)."
      },
      {
        "id": "m8-407", "type": "typein", "badge": "NEGATIVE",
        "prompt": "Fill in the blank to trigger a quīn clause:<br>______ dubitat quīn hoc vērum sit? (<strong>Who</strong> doubts that this is true?)",
        "hint": "The interrogative pronoun (Nom, Sg, Masc).",
        "answers": ["quis"],
        "explanation": "Quis. Rhetorical questions act as negatives."
      },
      {
        "id": "m8-408", "type": "typein", "badge": "FORM",
        "prompt": "Complete the quīn clause: <br>No one doubted that the city <strong>had been captured</strong>.<br>Nēmō dubitābat quīn urbs ______ (capere).",
        "hint": "Secondary sequence. Prior passive action = 3sg pluperfect passive subjunctive of capere (PPP: capta).",
        "answers": ["capta esset"],
        "explanation": "capta esset. (Pluperfect passive subjunctive)."
      },
      {
        "id": "m8-409", "type": "typein", "badge": "TRIGGER WORD",
        "prompt": "Translate the bolded word: <br>Nihil mē impedit <strong>quīn</strong> eam. <br>Nothing prevents me ______ going.",
        "hint": "A four-letter English preposition.",
        "answers": ["from"],
        "explanation": "After verbs of hindering, quīn means 'from'."
      }
    ]
  },

  "relative_subjunctive": {
    "id": "relative_subjunctive",
    "title": "Relative Clause Subjunctive",
    "badge": "M9",
    "description": "Sometimes relative clauses (who/which/that) use the subjunctive instead of the indicative. Know why.",
    "concepts": ["Relative Purpose", "Characteristic"],
    "questions": [
      // --- PART 1: RULES & TRIGGERS ---
      {
        "id": "m9-101", "type": "mc", "badge": "RULE",
        "prompt": "When a relative pronoun (quī, quae, quod) takes the place of 'ut' to express <strong>why</strong> an action was done, what is this called?",
        "hint": "It expresses the intention of the antecedent.",
        "correct": "Relative Clause of Purpose",
        "choices": ["Relative Clause of Characteristic", "Relative Clause of Purpose", "Relative Clause of Result", "Simple Relative Clause"],
        "explanation": "A Relative Clause of Purpose uses a relative pronoun instead of 'ut' to refer back to a specific antecedent (e.g., He sent envoys WHO might seek peace)."
      },
      {
        "id": "m9-102", "type": "mc", "badge": "RULE",
        "prompt": "Which type of clause describes the <strong>general sort, kind, or character</strong> of an indefinite antecedent?",
        "hint": "Used when the antecedent isn't a specific person you can point to.",
        "correct": "Relative Clause of Characteristic",
        "choices": ["Relative Clause of Characteristic", "Relative Clause of Purpose", "Relative Clause of Result", "Simple Relative Clause"],
        "explanation": "Characteristic clauses use the subjunctive to say 'He is the SORT of man who would do this', rather than just stating a flat fact."
      },
      {
        "id": "m9-103", "type": "mc", "badge": "TRIGGER WORD",
        "prompt": "The phrase <strong>Sunt quī...</strong> (There are those who...) almost always triggers which type of clause?",
        "hint": "Describes the kind of people they are.",
        "correct": "Relative Clause of Characteristic",
        "choices": ["Relative Clause of Characteristic", "Relative Clause of Purpose", "Indirect Question", "Fear Clause"],
        "explanation": "'Sunt quī' sets up an indefinite group, so the following verb will be in the subjunctive to describe their characteristics."
      },
      {
        "id": "m9-104", "type": "mc", "badge": "TRIGGER WORD",
        "prompt": "Which of these phrases is a classic trigger for a Relative Clause of Characteristic?",
        "hint": "A negative indefinite antecedent.",
        "correct": "Nēmō est quī",
        "choices": ["Ita accidit ut", "Nēmō est quī", "Nōn dubitō quīn", "Tantus erat ut"],
        "explanation": "'Nēmō est quī...' (There is no one who...) is a standard trigger for a characteristic clause."
      },
      {
        "id": "m9-105", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "The adjectives <strong>dignus</strong> (worthy) and <strong>indignus</strong> (unworthy) are often followed by a relative pronoun and a subjunctive verb. What type of clause is this?",
        "hint": "He is worthy WHO should do this.",
        "correct": "Relative Clause of Result / Characteristic",
        "choices": ["Relative Clause of Purpose", "Relative Clause of Result / Characteristic", "Indirect Command", "Indirect Question"],
        "explanation": "Phrases like 'dignus est quī hoc faciat' (He is worthy to do this) use a relative clause with the subjunctive."
      },

      // --- PART 2: IDENTIFICATION & DISCRIMINATION ---
      {
        "id": "m9-201", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Identify the clause: Lēgātōs mīsit <strong>quī pācem peterent</strong>.",
        "hint": "Why did he send them?",
        "correct": "Relative Clause of Purpose",
        "choices": ["Relative Clause of Characteristic", "Relative Clause of Purpose", "Simple Relative Clause", "Indirect Command"],
        "explanation": "Purpose. 'quī' = 'ut eī'. 'He sent envoys WHO were to seek peace.'"
      },
      {
        "id": "m9-202", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Identify the clause: Quis est <strong>quī hoc nēsciat</strong>?",
        "hint": "Quis est = Who is there? (Indefinite).",
        "correct": "Relative Clause of Characteristic",
        "choices": ["Relative Clause of Characteristic", "Relative Clause of Purpose", "Simple Relative Clause", "Indirect Question"],
        "explanation": "Characteristic. 'Who is there WHO would not know this?' Describes the sort of person."
      },
      {
        "id": "m9-203", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Identify the clause: Virum vīdī <strong>quī in forō stābat</strong>.",
        "hint": "Look at the mood of 'stābat' (indicative).",
        "correct": "Simple Relative Clause",
        "choices": ["Relative Clause of Characteristic", "Relative Clause of Purpose", "Simple Relative Clause", "Relative Clause of Result"],
        "explanation": "Simple Relative Clause. Because the verb (stābat) is in the indicative, it is just stating a hard fact about a specific man, not expressing purpose or characteristic."
      },
      {
        "id": "m9-204", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Identify the clause: Sōlus erat <strong>quī mē iuvāret</strong>.",
        "hint": "Sōlus erat = He was the only one. Describes his unique character.",
        "correct": "Relative Clause of Characteristic",
        "choices": ["Relative Clause of Characteristic", "Relative Clause of Purpose", "Quin Clause", "Fear Clause"],
        "explanation": "Characteristic. Expressions like 'ūnus est quī' or 'sōlus est quī' trigger characteristic clauses."
      },

      // --- PART 3: TRANSLATION MATCHING ---
      {
        "id": "m9-301", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Sunt quī putent terram esse plānam.</strong>",
        "hint": "Sunt quī = There are those who...",
        "correct": "There are those who think the earth is flat.",
        "choices": ["They are the ones who think the earth is flat.", "There are those who think the earth is flat.", "If only they thought the earth was flat.", "Are there people who think the earth is flat?"],
        "explanation": "Sunt quī + subjunctive = 'There are those who [verb]'."
      },
      {
        "id": "m9-302", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Nēmō est quī hoc nōn intellegat.</strong>",
        "hint": "Double negative concept.",
        "correct": "There is no one who does not understand this.",
        "choices": ["No one understood this.", "There is no one who does not understand this.", "Let no one understand this.", "Why does no one understand this?"],
        "explanation": "Nēmō est quī = There is no one who. intellegat = present subjunctive."
      },
      {
        "id": "m9-303", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Mīlitēs mīsit quī castra dēfenderent.</strong>",
        "hint": "Relative Purpose.",
        "correct": "He sent soldiers to defend the camp.",
        "choices": ["He sent soldiers who were defending the camp.", "He sent soldiers to defend the camp.", "There are soldiers who defend the camp.", "The soldiers he sent defended the camp."],
        "explanation": "Relative clause of purpose is best translated as an infinitive in English ('to defend')."
      },
      {
        "id": "m9-304", "type": "mc", "badge": "TRANSLATE",
        "prompt": "How do you translate: <strong>Dignus est quī imperet.</strong>",
        "hint": "dignus = worthy.",
        "correct": "He is worthy to rule.",
        "choices": ["He rules worthily.", "He is worthy to rule.", "Let the worthy man rule.", "There is a worthy man who rules."],
        "explanation": "Dignus + relative clause is translated with an infinitive in English. 'He is worthy WHO should rule' -> 'He is worthy to rule.'"
      },

      // --- PART 4: SEQUENCE OF TENSES ---
      {
        "id": "m9-401", "type": "mc", "badge": "SEQUENCE",
        "prompt": "Nūntiōs <strong>mittit</strong> quī rēgī haec <strong>nūntient</strong>.<br>Why is the subjunctive present tense?",
        "hint": "Mittit = present tense.",
        "correct": "Primary sequence, simultaneous/subsequent action",
        "choices": ["Secondary sequence, simultaneous action", "Primary sequence, simultaneous/subsequent action", "Primary sequence, prior action", "Secondary sequence, prior action"],
        "explanation": "Mittit (primary) requires a present subjunctive (nūntient) for purpose clauses."
      },
      {
        "id": "m9-402", "type": "mc", "badge": "SEQUENCE",
        "prompt": "Nūntiōs <strong>mīsit</strong> quī rēgī haec <strong>nūntiārent</strong>.<br>Why is the subjunctive imperfect tense?",
        "hint": "Mīsit = perfect tense.",
        "correct": "Secondary sequence, simultaneous/subsequent action",
        "choices": ["Primary sequence, simultaneous action", "Secondary sequence, prior action", "Primary sequence, prior action", "Secondary sequence, simultaneous/subsequent action"],
        "explanation": "Mīsit (secondary) requires an imperfect subjunctive (nūntiārent) for purpose clauses."
      },
      {
        "id": "m9-403", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Erat nēmō quī hoc <strong>fēcisset</strong>.<br>What sequence and relative time is this?",
        "hint": "Erat = secondary. fēcisset = pluperfect.",
        "correct": "Secondary sequence, prior action",
        "choices": ["Secondary sequence, prior action", "Secondary sequence, simultaneous action", "Primary sequence, prior action", "Primary sequence, simultaneous action"],
        "explanation": "Erat (imperfect) = secondary. They ALREADY did the action -> prior time -> Pluperfect Subjunctive. 'There was no one who HAD done this.'"
      },

      // --- PART 5: TYPE-IN (Production) ---
      {
        "id": "m9-501", "type": "typein", "badge": "FORM",
        "prompt": "Complete the clause: <br>He sends men to <strong>fight</strong>.<br>Virōs mittit quī ______ (pugnāre).",
        "hint": "Primary sequence. 3rd person plural present active subjunctive.",
        "answers": ["pugnent"],
        "explanation": "pugnent. (Relative Purpose)."
      },
      {
        "id": "m9-502", "type": "typein", "badge": "FORM",
        "prompt": "Complete the clause: <br>He sent men to <strong>fight</strong>.<br>Virōs mīsit quī ______ (pugnāre).",
        "hint": "Secondary sequence. 3rd person plural imperfect active subjunctive.",
        "answers": ["pugnarent"],
        "explanation": "pugnārent. (Relative Purpose)."
      },
      {
        "id": "m9-503", "type": "typein", "badge": "FORM",
        "prompt": "Complete the clause: <br>There are those who <strong>believe</strong> this.<br>Sunt quī hoc ______ (crēdere).",
        "hint": "Primary sequence. 3rd person plural present active subjunctive.",
        "answers": ["credant"],
        "explanation": "crēdant. (Relative Characteristic)."
      },
      {
        "id": "m9-504", "type": "typein", "badge": "FORM",
        "prompt": "Complete the clause: <br>There was no one who <strong>knew</strong>.<br>Erat nēmō quī ______ (scīre).",
        "hint": "Secondary sequence. 3rd person singular imperfect active subjunctive.",
        "answers": ["sciret"],
        "explanation": "scīret. (Relative Characteristic)."
      },
      {
        "id": "m9-505", "type": "typein", "badge": "FORM",
        "prompt": "Complete the clause: <br>She was the only one who <strong>was able</strong>.<br>Sōla erat quae ______ (posse).",
        "hint": "Secondary sequence. 3rd person singular imperfect active subjunctive of posse.",
        "answers": ["posset"],
        "explanation": "posset. (Relative Characteristic)."
      },
      {
        "id": "m9-506", "type": "typein", "badge": "FORM",
        "prompt": "Complete the clause: <br>He chose a leader to <strong>rule</strong> the state.<br>Ducem dēlēgit quī rem pūblicam ______ (regere).",
        "hint": "Secondary sequence (dēlēgit = perfect). 3rd person singular imperfect active subjunctive of regere.",
        "answers": ["regeret"],
        "explanation": "regeret. (Relative Purpose)."
      },
      {
        "id": "m9-507", "type": "typein", "badge": "FORM",
        "prompt": "Fill in the correct relative pronoun: <br>He sent an army to destroy the city.<br>Exercitum mīsit ______ urbem dēlēret.",
        "hint": "Pronoun must match the antecedent (exercitum: masc, sg) in gender and number, but its case is determined by its role in its own clause (subject = nominative).",
        "answers": ["qui"],
        "explanation": "quī. (Nominative, singular, masculine)."
      },
      {
        "id": "m9-508", "type": "typein", "badge": "FORM",
        "prompt": "Complete the clause: <br>Who is there who <strong>would do</strong> such a thing?<br>Quis est quī tālia ______ (facere)?",
        "hint": "Primary sequence. 3rd person singular present active subjunctive of facere.",
        "answers": ["faciat"],
        "explanation": "faciat. (Relative Characteristic)."
      },
      // Add to MODULE_DB["relative_subjunctive"].questions

      {
        "id": "m9-601", "type": "mc", "badge": "CHARACTERISTIC",
        "prompt": "<strong>Nēmō est quī hoc crēdat.</strong>",
        "hint": "Describes the 'kind' of people that exist (or don't).",
        "correct": "There is no one who [is the type to] believe this.",
        "choices": [
          "No one believes this.",
          "There is no one who believes this [fact].",
          "There is no one who [is the type to] believe this.",
          "Someone believes this."
        ],
        "explanation": "The subjunctive (crēdat) makes this a 'characteristic' clause—it defines the nature of the person."
      },
      {
        "id": "m9-602", "type": "mc", "badge": "DISCRIMINATE",
        "prompt": "Which sentence uses a <strong>Relative Clause of Purpose</strong>?",
        "hint": "Look for a relative pronoun replacing 'ut'.",
        "correct": "Glabriōnem mīsērunt quī fīnēs dēfenderet.",
        "choices": [
          "Glabriōnem mīsērunt quī fīnēs dēfenderet.",
          "Glabriō est vir quī fīnēs dēfendit.",
          "Is est quī fīnēs dēfendat.",
          "Sunt quī fīnēs dēfendant."
        ],
        "explanation": "The first one: 'They sent Glabrio [WHO = in order that he] might defend the borders.'"
      },
      {
        "id": "m9-603", "type": "typein", "badge": "FORM",
        "prompt": "Complete the Characteristic clause: <br>He is the only one who <strong>is able</strong> to do this.<br>Sōlus est quī hoc ______ (posse).",
        "hint": "Primary sequence. 3rd person singular present active subjunctive of posse.",
        "answers": ["possit"],
        "explanation": "possit. 'Sōlus est quī' is a major trigger for the characteristic subjunctive."
      },
      {
        "id": "m9-604", "type": "mc", "badge": "DIGNUS",
        "prompt": "<strong>Dignus est quī amētur.</strong>",
        "hint": "Dignus + Relative Subjunctive.",
        "correct": "He is worthy to be loved.",
        "choices": [
          "He is loved worthily.",
          "He is worthy to be loved.",
          "He is the type of man who loves.",
          "He was worthy because he was loved."
        ],
        "explanation": "Dignus/Indignus (worthy/unworthy) take a relative clause with the subjunctive."
      },
      {
        "id": "m9-605", "type": "typein", "badge": "SOT",
        "prompt": "Translate the verb: 'We chose a place where we <strong>might stay</strong>.' (manēre)",
        "hint": "Dēlēgimus (secondary). Simultaneous/Purpose = 1st person plural imperfect active subjunctive.",
        "answers": ["maneremus"],
        "explanation": "manērēmus. Secondary sequence requires the imperfect subjunctive."
      },
      {
        "id": "m9-606", "type": "mc", "badge": "EXAM TRAP",
        "prompt": "Identify the <strong>Indicative</strong> relative clause (simple fact):",
        "hint": "One of these is just a statement of fact, not a characteristic or purpose.",
        "correct": "Hic est mīles quī in bellō pugnāvit.",
        "choices": [
          "Hic est mīles quī in bellō pugnāvit.",
          "Mīles mīssus est quī pugnāret.",
          "Sunt mīlitēs quī pugnent.",
          "Dignus est mīles quī pugnet."
        ],
        "explanation": "The first one is a simple fact: 'This is the soldier who fought.' The others are purpose, characteristic, and result-oriented."
      }

    ]
  }
};