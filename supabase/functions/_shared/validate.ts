// Shared by the edge functions (Deno) and the web client (Vite). Keep dependency-free.

export const JOIN_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const JOIN_CODE_RE = new RegExp(`^[${JOIN_CODE_ALPHABET}]{6}$`);

export interface JoinInput {
  join_code: string;
  display_name: string;
  pin: string;
}
export type Validated<T> = { ok: true; value: T } | { ok: false; error: string };

export const validatePin = (pin: unknown): boolean => typeof pin === 'string' && /^\d{6}$/.test(pin);

export function normalizeJoinCode(code: unknown): string | null {
  if (typeof code !== 'string') return null;
  const c = code.trim().toUpperCase();
  return JOIN_CODE_RE.test(c) ? c : null;
}

export function normalizeDisplayName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const n = name.trim().replace(/\s+/g, ' ');
  return n.length >= 1 && n.length <= 24 ? n : null;
}

export function validateJoin(input: Partial<Record<keyof JoinInput, unknown>>): Validated<JoinInput> {
  const join_code = normalizeJoinCode(input.join_code);
  if (!join_code) return { ok: false, error: 'Class code must be 6 characters' };
  const display_name = normalizeDisplayName(input.display_name);
  if (!display_name) return { ok: false, error: 'Name must be 1–24 characters' };
  if (!validatePin(input.pin)) return { ok: false, error: 'PIN must be 6 digits' };
  return { ok: true, value: { join_code, display_name, pin: input.pin as string } };
}
