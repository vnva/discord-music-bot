export function secondsToHms(rawSeconds: number, short = false): string {
  rawSeconds = Number(rawSeconds);

  const h = Math.floor(rawSeconds / 3600);
  const m = Math.floor((rawSeconds % 3600) / 60);
  const s = Math.floor((rawSeconds % 3600) % 60);

  if (short) return `${`${h}`.padStart(2, '0')}:${`${m}`.padStart(2, '0')}:${`${s}`.padStart(2, '0')}`;

  const hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';

  return hDisplay + mDisplay + sDisplay;
}
