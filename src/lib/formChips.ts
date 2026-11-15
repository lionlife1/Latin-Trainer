import { escapeHtml } from './html';

/** A row of labelled chips (caption above, value below), one per grammatical feature. Values are escaped here. */
export function formChipsHtml(parts: { key: string; value: string }[]): string {
    const chips = parts
        .map(p => `<span class='form-chip'><span class='form-chip-k'>${escapeHtml(p.key)}</span><span class='form-chip-v'>${escapeHtml(p.value)}</span></span>`)
        .join('');
    return `<div class='form-chips'>${chips}</div>`;
}
