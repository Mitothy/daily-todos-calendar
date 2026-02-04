const COLOR_MAP: Record<number, string> = {
  0: '8',   // Gray
  1: '11',  // Red
  2: '4',   // Pale Red
  3: '6',   // Orange
  4: '5',   // Yellow
  5: '2',   // Pale Green
  6: '10',  // Green
};

export function getColorId(completedCount: number): string {
  if (completedCount < 0 || completedCount > 6) {
    throw new Error('Invalid completion count. Must be 0-6.');
  }
  return COLOR_MAP[completedCount];
}

export const HEX_COLORS: Record<number, string> = {
  0: '#5A5A5A',
  1: '#DC2127',
  2: '#FF887C',
  3: '#FFB878',
  4: '#FBD75B',
  5: '#7AE7BF',
  6: '#51B749',
};
