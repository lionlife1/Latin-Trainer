/** "capiō, capere, cēpī, captum" -> "capiō"; "in + acc." -> "in". */
export function lemmaOf(headword: string): string {
  return headword.trim().split(/[,\s]/)[0];
}
