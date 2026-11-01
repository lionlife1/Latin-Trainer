const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today", "Yesterday", "3 days ago", then a short date from a week back. Local calendar days. */
export function relativeDay(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const days = Math.round((dayStart(now) - dayStart(then)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
