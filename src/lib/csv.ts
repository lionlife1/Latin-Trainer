type Cell = string | number | null;

function cell(v: Cell): string {
  if (v === null) return '';
  if (typeof v === 'number') return String(v);
  // Stop spreadsheets from evaluating student-entered text as formulas.
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** RFC 4180 CSV with CRLF line endings. */
export function toCsv(rows: Cell[][]): string {
  return rows.map(r => r.map(cell).join(',') + '\r\n').join('');
}

/** One CSV line -> trimmed fields. Handles quoted fields with commas and doubled quotes. */
export function parseCsvRow(line: string): string[] {
  const out: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"' && field.trim() === '') {
      field = '';
      quoted = true;
    } else if (ch === ',') {
      out.push(field.trim());
      field = '';
    } else field += ch;
  }
  out.push(field.trim());
  return out;
}

export function downloadCsv(filename: string, csv: string) {
  downloadText(filename, '﻿' + csv, 'text/csv;charset=utf-8');
}

export function downloadText(filename: string, text: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
