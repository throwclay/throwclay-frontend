export function linearize(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, '0').toUpperCase())
      .join('')
  );
}

export function rgbToOklch(
  r: number,
  g: number,
  b: number,
  a?: number
): string {
  const rLin = linearize(r / 255);
  const gLin = linearize(g / 255);
  const bLin = linearize(b / 255);

  const l =
    0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
  const m =
    0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
  const s =
    0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(A * A + B * B);
  let H = Math.atan2(B, A) * (180 / Math.PI);
  if (H < 0) H += 360;

  const Lp = (L * 100).toFixed(1);
  const Cp = C.toFixed(4);
  const Hp = H.toFixed(1);

  if (a !== undefined) {
    return `oklch(${Lp}% ${Cp} ${Hp} / ${a})`;
  }
  return `oklch(${Lp}% ${Cp} ${Hp})`;
}

export function rgbToCssString(
  r: number,
  g: number,
  b: number,
  a?: number
): string {
  if (a !== undefined) return `rgba(${r}, ${g}, ${b}, ${a})`;
  return `rgb(${r}, ${g}, ${b})`;
}

/** Returns true if a colour is "dark" (should use white text on it) */
export function isDark(r: number, g: number, b: number): boolean {
  const luminance =
    0.2126 * linearize(r / 255) +
    0.7152 * linearize(g / 255) +
    0.0722 * linearize(b / 255);
  return luminance < 0.3;
}

/**
 * Converts an 'rgb(r,g,b)' or 'rgba(r,g,b,a)' token string to 'rgba(r,g,b,alpha)'.
 * Use this whenever you need a semi-transparent version of a theme color token
 * (tc.brand, tc.divider, etc.) — never append raw hex digits to an rgb() string.
 *
 * Example:
 *   withAlpha('rgb(255,111,0)', 0.30)  →  'rgba(255,111,0,0.30)'
 */
export function withAlpha(color: string, alpha: number): string {
  // Strip existing alpha if present, then re-add the new one
  const inner = color
    .replace(/^rgba?\(/, '')  // remove leading 'rgb(' or 'rgba('
    .replace(/\)$/, '')        // remove closing ')'
    .split(',')
    .slice(0, 3)               // keep only r, g, b components
    .join(',');
  return `rgba(${inner},${alpha})`;
}

/**
 * Parses a CSS color string (hex or rgba/rgb) into numeric components.
 * Supports: '#RRGGBB', 'rgb(r,g,b)', 'rgba(r,g,b,a)'
 */
export function parseColorString(color: string): { rgb: [number, number, number]; alpha?: number } {
  const rgba = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgba) {
    return {
      rgb: [parseInt(rgba[1]), parseInt(rgba[2]), parseInt(rgba[3])],
      alpha: rgba[4] !== undefined ? parseFloat(rgba[4]) : undefined,
    };
  }
  const hex = color.replace('#', '');
  if (hex.length === 6) {
    return {
      rgb: [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ],
    };
  }
  return { rgb: [0, 0, 0] };
}