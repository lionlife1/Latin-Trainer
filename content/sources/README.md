# Lexicon sources

Only public-domain or any-use sources belong here. No CC BY-SA source (DCC, Perseus, Wiktionary, LiLa, or similar) may be added to `content/sources/`.

## whitaker/DICTLINE.GEN, whitaker/LICENCE.txt

- Source: William Whitaker's Words, as packaged at https://github.com/mk270/whitakers-words, pinned to commit `a21505c180e1d6ce49263e5185fde3326e1e59c8`.
- License: LICENCE.txt grants "Permission is hereby freely given for any and all use of program and data".
- Produced by:

```bash
B=https://raw.githubusercontent.com/mk270/whitakers-words/a21505c180e1d6ce49263e5185fde3326e1e59c8
curl -sL -o content/sources/whitaker/DICTLINE.GEN $B/DICTLINE.GEN
curl -sL -o content/sources/whitaker/LICENCE.txt $B/LICENCE.txt
```

DICTLINE.GEN keeps its original CRLF line endings; parsers strip `\r`.

## dooge-latin-english.txt

- Source: Benjamin L. D'Ooge, *Latin for Beginners* (1911), Project Gutenberg #18251, https://www.gutenberg.org/cache/epub/18251/pg18251.txt
- License: published 1911, public domain in the US.
- Produced by keeping only the Latin-English vocabulary section (CR characters removed):

```bash
curl -sL https://www.gutenberg.org/cache/epub/18251/pg18251.txt | tr -d '\r' \
  | awk '/^LATIN-ENGLISH VOCABULARY$/{on=1} /^ENGLISH-LATIN VOCABULARY$/{on=0} on' \
  > content/sources/dooge-latin-english.txt
```

The file includes the Gutenberg transcriber's note about [[double brackets]] but no Gutenberg license text.

## lodge-core.tsv

- Source: Gonzalez Lodge, *Vocabulary of High School Latin* (1909), https://archive.org/details/vocabularyofhigh00lodguoft. Cross-checked against other scans of the same book: https://archive.org/details/cu31924021622125 (1907) and https://archive.org/details/vocabularyhighs01lodggoog (1909).
- License: published 1909, public domain in the US.
- Format: UTF-8, one `number<TAB>lemma` per line, numbers 1-2000, no header. Lodge numbers his list alphabetically (1 a … 2000 vultus), so the number is not a frequency rank; it only marks a word as core and is not stored or used for search order. The lemma is Lodge's first word as printed: lowercase, hyphens kept, no macrons.
- Produced from the archive.org OCR text of the vocabulary section. Entry numbers (including OCR-garbled ones such as `iioi.`) and first words were extracted, the three OCR copies were compared, and remaining gaps and OCR errors were fixed by hand against the printed context. Task 4 of the lexicon plan checks the lemmas against the other sources.
