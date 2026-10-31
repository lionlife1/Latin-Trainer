/**
 * Dictionary form -> the word students type.
 * "capiō, capere, cēpī, captum" -> "capiō"; "rēs pūblica, reī pūblicae" -> "rēs pūblica"; "in + acc." -> "in".
 */
export function lemmaOf(headword: string): string {
  return headword.split(',')[0].replace(/\s*\+.*$/, '').trim();
}
