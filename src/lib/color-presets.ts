export const COLOR_PRESETS: { name: string; hsl: string; hex: string }[] = [
  { name: 'Biru (Default)', hsl: '221 83% 53%', hex: '#2563EB' },
  { name: 'Hijau', hsl: '142 71% 45%', hex: '#22C55E' },
  { name: 'Merah', hsl: '0 72% 51%', hex: '#EF4444' },
  { name: 'Ungu', hsl: '271 81% 56%', hex: '#8B5CF6' },
  { name: 'Orange', hsl: '25 95% 53%', hex: '#F97316' },
  { name: 'Teal', hsl: '173 80% 36%', hex: '#0D9488' },
];

/**
 * Given a primary HSL string like "221 83% 53%", return CSS custom properties
 * for --primary, --primary-foreground, --ring, --secondary, etc.
 */
export function generatePrimaryColorCSS(hsl: string): string {
  const h = hsl.split(' ')[0];
  const s = hsl.split(' ')[1];
  const l = hsl.split(' ')[2];

  return `
    :root {
      --primary: ${hsl};
      --primary-foreground: 0 0% 100%;
      --ring: ${hsl};
      --secondary: ${h} 100% 97%;
      --secondary-foreground: ${hsl};
      --sidebar-primary: ${hsl};
      --sidebar-primary-foreground: 0 0% 100%;
      --sidebar-accent: ${h} 100% 97%;
      --sidebar-accent-foreground: ${hsl};
      --sidebar-ring: ${hsl};
    }
  `.trim();
}

/** Get HSL from a preset name (case-insensitive match on label prefix) */
export function getPresetHsl(name: string): string {
  const preset = COLOR_PRESETS.find(
    (p) => p.name.toLowerCase().startsWith(name.toLowerCase())
  );
  return preset?.hsl || COLOR_PRESETS[0].hsl;
}
