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

export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
