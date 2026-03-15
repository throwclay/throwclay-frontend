/**
 * designTokens.ts — Throw Clay Design Token System (v1.0)
 *
 * This is the SINGLE SOURCE OF TRUTH for all design tokens.
 * Every value used to style this page is derived from one of the exports below.
 * No raw CSS values should exist anywhere in the codebase — only token references.
 *
 * Token naming follows the pattern: category.[group].[variant]
 * Token names are mode-agnostic: color.brand.default is always color.brand.default.
 * The resolved value changes per mode via ThemeContext — the name does not.
 *
 * Strictly derived from: /src/imports/throw-clay-design-tokens.json
 */

import type { CSSProperties } from 'react';

// ─── Font stacks ──────────────────────────────────────────────────────────────

export const fonts = {
  'type.font.sans':  "'Satoshi', sans-serif",
  'type.font.brand': "'Big Shoulders Display', sans-serif",
  'type.font.mono':  'ui-monospace, monospace',
} as const;

// ─── Typography tokens ────────────────────────────────────────────────────────
// Each entry resolves to a complete set of CSS typography properties.
// Spread directly into React inline styles:
//   <p style={{ ...T['type.body.large'], color: tc.textPrimary }}>
//
// Letter-spacing percentages converted to em:  % / 100 = em
//   -0.50% → -0.005em  |  0.75% → 0.0075em  |  3.25% → 0.0325em  |  4.50% → 0.045em

const sans  = fonts['type.font.sans'];
const brand = fonts['type.font.brand'];
const mono  = fonts['type.font.mono'];

export const T: Record<string, CSSProperties> = {
  // ── Display ──────────────────────────────────────────────────────────────
  // Purpose: Hero sections, marketing headers, landing pages.
  'type.display.large': {
    fontFamily: sans, fontSize: '56px', fontWeight: 400,
    lineHeight: '64px', letterSpacing: '-0.005em',
  },
  'type.display.small': {
    fontFamily: sans, fontSize: '36px', fontWeight: 400,
    lineHeight: '44px', letterSpacing: '0em',
  },

  // ── Headline ─────────────────────────────────────────────────────────────
  // Purpose: Page titles, major sections, card titles.
  'type.headline.large': {
    fontFamily: sans, fontSize: '32px', fontWeight: 600,
    lineHeight: '44px', letterSpacing: '0em',
  },
  'type.headline.medium': {
    fontFamily: sans, fontSize: '28px', fontWeight: 500,
    lineHeight: '36px', letterSpacing: '0em',
  },
  'type.headline.small': {
    fontFamily: sans, fontSize: '24px', fontWeight: 500,
    lineHeight: '36px', letterSpacing: '0.0075em',
  },

  // ── Title ─────────────────────────────────────────────────────────────────
  // Purpose: Component headers, dialogs, important UI labels.
  'type.title.large': {
    fontFamily: sans, fontSize: '22px', fontWeight: 600,
    lineHeight: '28px', letterSpacing: '0em',
  },
  'type.title.medium': {
    fontFamily: sans, fontSize: '18px', fontWeight: 600,
    lineHeight: '28px', letterSpacing: '0.0075em',
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  // Purpose: Paragraphs, descriptions, UI copy.
  'type.body.large': {
    fontFamily: sans, fontSize: '18px', fontWeight: 400,
    lineHeight: '28px', letterSpacing: '0.015em',
  },
  'type.body.medium': {
    fontFamily: sans, fontSize: '16px', fontWeight: 400,
    lineHeight: '22px', letterSpacing: '0.025em',
  },
  'type.body.small': {
    fontFamily: sans, fontSize: '14px', fontWeight: 425,
    lineHeight: '22px', letterSpacing: '0.035em',
  },

  // ── Micro ─────────────────────────────────────────────────────────────────
  // Purpose: Captions, overlines, metadata, timestamps, helper text.
  // textTransform: 'uppercase' is BAKED INTO this token — do not add it at the call site,
  // and never suppress it. This is one of two always-uppercase tokens in the system.
  'type.micro': {
    fontFamily: sans, fontSize: '12px', fontWeight: 500,
    lineHeight: '16px', letterSpacing: '0.045em', textTransform: 'uppercase' as const,
  },

  // ── Code ──────────────────────────────────────────────────────────────────
  // Purpose: Token names, raw values, code snippets, dashboard metrics.
  // Uses type.font.mono (system monospace stack).
  'type.code': {
    fontFamily: mono, fontSize: '12px', fontWeight: 450,
    lineHeight: '16px', letterSpacing: '0em',
  },

  // ── Brand Display ─────────────────────────────────────────────────────────
  // Purpose: Hero sections, landing pages, brand moments.
  'type.brand.display': {
    fontFamily: brand, fontSize: '56px', fontWeight: 800,
    lineHeight: '64px', letterSpacing: '0em',
  },
  'type.brand.display-small': {
    fontFamily: brand, fontSize: '40px', fontWeight: 800,
    lineHeight: '44px', letterSpacing: '0.02em',
  },

  // ── Brand Headline ────────────────────────────────────────────────────────
  // Purpose: Section labels, callouts, brand-accented titles.
  'type.brand.headline-large': {
    fontFamily: brand, fontSize: '24px', fontWeight: 800,
    lineHeight: '36px', letterSpacing: '0.04em',
  },
  'type.brand.headline-small': {
    fontFamily: brand, fontSize: '16px', fontWeight: 800,
    lineHeight: '22px', letterSpacing: '0.08em', textTransform: 'uppercase' as const,
  },
};

// ─── Spacing tokens ───────────────────────────────────────────────────────────
// Built on a 4px base unit. All values are multiples of 4px.
// Token: spacing.[value]  |  Usage: sp['spacing.16px']
//
// spacing.2px — sub-unit, badge/pill vertical padding only (half base unit)
// spacing.6px — fine spacing for indicator dots and decorative elements

export const sp = {
  'spacing.2px':  '2px',
  'spacing.4px':  '4px',
  'spacing.6px':  '6px',
  'spacing.8px':  '8px',
  'spacing.12px': '12px',
  'spacing.16px': '16px',
  'spacing.20px': '20px',
  'spacing.24px': '24px',
  'spacing.32px': '32px',
  'spacing.48px': '48px',
  'spacing.64px': '64px',
  'spacing.80px': '80px',
} as const;

// ─── Border tokens ────────────────────────────────────────────────────────────
// border.color.default references color.ui.divider — resolved at runtime via ThemeContext.
// Token: border.[property].[modifier]  |  Usage: bdr['border.width.default']
//
// border.width.indicator — 2px, active-state indicators only (sidebar nav, focus rings).
//   Never use for structural borders. Structural borders always use border.width.default (1px).

export const bdr = {
  'border.width.default':   '1px',
  'border.width.indicator': '2px',
  'border.style.solid':     'solid',
  'border.style.dashed':    'dashed',
  // border.color.default → tc.divider        (resolved via ThemeContext at render time)
  // border.color.dashed  → tc.dividerDashed
} as const;

// ─── Corner radius tokens ─────────────────────────────────────────────────────
// corner.radius.default = 0px  — sharp, square corners (all standard UI components).
// corner.radius.rounded = 1000px — fully rounded pill/circle (avatars, pill badges).
// Token: corner.radius.[variant]  |  Usage: cr['corner.radius.default']

export const cr = {
  'corner.radius.default': '0px',
  'corner.radius.rounded': '1000px',  // pill — guarantees full rounding at any dimension
} as const;

// ─── Z-index (layering) tokens ────────────────────────────────────────────────
// Controls visual stacking order. Never use arbitrary z-index values.
// Token: z.[layer]  |  Usage: zi['z.sticky']

export const zi = {
  'z.base':     0,
  'z.dropdown': 100,
  'z.sticky':   200,
  'z.overlay':  300,
  'z.modal':    400,
  'z.toast':    500,
  'z.tooltip':  600,
} as const;

// ─── Sizing tokens ────────────────────────────────────────────────────────────
// Icon containers align with typographic line heights for natural text alignment.
// Token: size.[element].[variant]  |  Usage: sz['size.icon.medium']

export const sz = {
  // Icon container sizes (container height = line height it aligns with)
  'size.icon.container.small':  '16px',   // aligns with type.micro / type.code line height
  'size.icon.container.medium': '22px',   // aligns with type.body.medium / type.body.small line height
  'size.icon.container.large':  '36px',   // aligns with type.headline.small / type.headline.medium line height (36px)
  'size.icon.container.xl':     '44px',   // aligns with type.title.large / larger UI line heights

  // Icon sizes (the icon SVG itself, centered inside its container)
  'size.icon.small':  '12px',
  'size.icon.medium': '16px',
  'size.icon.large':  '24px',
  'size.icon.xl':     '32px',   // 32px (not 36px) — proportional balance within the 44px container

  // Avatar sizes
  'size.avatar.small':  '22px',   // dense lists, compact metadata
  'size.avatar.medium': '36px',   // cards, comment threads
  'size.avatar.large':  '44px',   // profile blocks, key UI sections
  'size.avatar.xl':     '64px',   // profile headers, account pages
} as const;

// ─── Color tokens — light mode ────────────────────────────────────────────────
// These are the canonical light-mode resolved values, exported so cssTokens.ts
// can derive its TCTokens from here rather than duplicating raw strings.
//
// Semi-transparent forms are used for divider and text tokens so they work correctly
// on any surface colour — including dark mode surfaces — without separate token names.
// The perceptual equivalents on white are noted for reference.
//
// Token: color.[palette].[variant]

export const colorTokensLight = {
  // ── color.brand ───────────────────────────────────────────────────────────
  'color.brand.container':    'rgb(255,233,214)',
  'color.brand.soft':         'rgb(255,196,140)',
  'color.brand.default':      'rgb(255,111,0)',
  'color.brand.bold':         'rgb(204,89,0)',
  'color.brand.on-container': 'rgb(90,38,0)',

  // ── color.success ─────────────────────────────────────────────────────────
  'color.success.container':    'rgb(230,246,239)',
  'color.success.soft':         'rgb(125,221,177)',
  'color.success.default':      'rgb(34,160,107)',
  'color.success.bold':         'rgb(22,122,82)',
  'color.success.on-container': 'rgb(11,61,42)',

  // ── color.warning ─────────────────────────────────────────────────────────
  'color.warning.container':    'rgb(255,244,217)',
  'color.warning.soft':         'rgb(255,210,122)',
  'color.warning.default':      'rgb(255,176,32)',
  'color.warning.bold':         'rgb(204,133,0)',
  'color.warning.on-container': 'rgb(106,67,0)',

  // ── color.error ───────────────────────────────────────────────────────────
  'color.error.container':    'rgb(255,231,231)',
  'color.error.soft':         'rgb(255,154,154)',
  'color.error.default':      'rgb(229,72,77)',
  'color.error.bold':         'rgb(179,54,57)',
  'color.error.on-container': 'rgb(90,27,29)',

  // ── color.pink ────────────────────────────────────────────────────────────
  'color.pink.container':    'rgb(255,230,241)',
  'color.pink.soft':         'rgb(255,156,196)',
  'color.pink.default':      'rgb(255,79,139)',
  'color.pink.bold':         'rgb(204,62,111)',
  'color.pink.on-container': 'rgb(92,30,55)',

  // ── color.violet ──────────────────────────────────────────────────────────
  'color.violet.container':    'rgb(239,234,255)',
  'color.violet.soft':         'rgb(184,168,255)',
  'color.violet.default':      'rgb(122,92,255)',
  'color.violet.bold':         'rgb(92,66,204)',
  'color.violet.on-container': 'rgb(47,36,102)',

  // ── color.blue ────────────────────────────────────────────────────────────
  'color.blue.container':    'rgb(234,241,255)',
  'color.blue.soft':         'rgb(143,182,255)',
  'color.blue.default':      'rgb(43,111,255)',
  'color.blue.bold':         'rgb(30,79,214)',
  'color.blue.on-container': 'rgb(26,61,143)',

  // ── color.cyan ────────────────────────────────────────────────────────────
  'color.cyan.container':    'rgb(230,255,252)',
  'color.cyan.soft':         'rgb(127,237,230)',
  'color.cyan.default':      'rgb(0,207,200)',
  'color.cyan.bold':         'rgb(0,154,149)',
  'color.cyan.on-container': 'rgb(0,86,84)',

  // ── color.green ───────────────────────────────────────────────────────────
  'color.green.container':    'rgb(232,247,238)',
  'color.green.soft':         'rgb(135,215,168)',
  'color.green.default':      'rgb(29,190,115)',
  'color.green.bold':         'rgb(22,151,90)',
  'color.green.on-container': 'rgb(10,71,48)',

  // ── color.orange ──────────────────────────────────────────────────────────
  'color.orange.container':    'rgb(255,234,223)',
  'color.orange.soft':         'rgb(255,183,143)',
  'color.orange.default':      'rgb(255,138,61)',
  'color.orange.bold':         'rgb(204,106,46)',
  'color.orange.on-container': 'rgb(92,45,15)',

  // ── color.yellow ──────────────────────────────────────────────────────────
  'color.yellow.container':    'rgb(255,246,219)',
  'color.yellow.soft':         'rgb(255,225,137)',
  'color.yellow.default':      'rgb(255,179,0)',
  'color.yellow.bold':         'rgb(204,140,0)',
  'color.yellow.on-container': 'rgb(90,65,0)',

  // ── color.red ─────────────────────────────────────────────────────────────
  'color.red.container':    'rgb(255,230,231)',
  'color.red.soft':         'rgb(255,156,159)',
  'color.red.default':      'rgb(229,72,77)',
  'color.red.bold':         'rgb(179,54,57)',
  'color.red.on-container': 'rgb(92,26,28)',

  // ── color.ui ──────────────────────────────────────────────────────────────
  'color.ui.surface':         'rgb(255,255,255)',
  'color.ui.interface-light': 'rgb(246,246,246)',
  'color.ui.interface-dark':  'rgb(236,236,236)',
  // Semi-transparent: resolves to ≈ rgb(218,218,218) on white, adapts on dark surfaces.
  'color.ui.divider':         'rgba(0,0,0,0.14)',
  'color.ui.divider-dashed':  'rgba(0,0,0,0.24)',
  'color.ui.overlay':         'rgba(0,0,0,0.45)',

  // ── color.text ────────────────────────────────────────────────────────────
  'color.text.primary':   'rgb(0,0,0)',
  // Semi-transparent: resolves to ≈ rgb(85,85,85) on white, adapts on dark surfaces.
  'color.text.secondary': 'rgba(0,0,0,0.67)',
  // Semi-transparent: resolves to ≈ rgb(136,136,136) on white.
  'color.text.tertiary':  'rgba(0,0,0,0.47)',
  'color.text.link':      'rgb(43,111,255)',
} as const;

// ─── Color tokens — dark mode ─────────────────────────────────────────────────
// Same token names, different resolved values.

export const colorTokensDark = {
  'color.brand.container':    'rgb(42,18,0)',
  'color.brand.soft':         'rgb(120,55,0)',
  'color.brand.default':      'rgb(255,130,50)',
  'color.brand.bold':         'rgb(255,175,105)',
  'color.brand.on-container': 'rgb(255,236,215)',

  'color.success.container':    'rgb(6,32,22)',
  'color.success.soft':         'rgb(16,85,58)',
  'color.success.default':      'rgb(42,188,126)',
  'color.success.bold':         'rgb(115,225,175)',
  'color.success.on-container': 'rgb(210,248,234)',

  'color.warning.container':    'rgb(38,25,0)',
  'color.warning.soft':         'rgb(95,65,0)',
  'color.warning.default':      'rgb(255,192,52)',
  'color.warning.bold':         'rgb(255,216,110)',
  'color.warning.on-container': 'rgb(255,249,212)',

  'color.error.container':    'rgb(42,10,12)',
  'color.error.soft':         'rgb(105,28,32)',
  'color.error.default':      'rgb(240,88,92)',
  'color.error.bold':         'rgb(255,152,155)',
  'color.error.on-container': 'rgb(255,228,228)',

  'color.pink.container':    'rgb(40,10,24)',
  'color.pink.soft':         'rgb(105,25,65)',
  'color.pink.default':      'rgb(255,92,152)',
  'color.pink.bold':         'rgb(255,170,205)',
  'color.pink.on-container': 'rgb(255,226,240)',

  'color.violet.container':    'rgb(20,8,50)',
  'color.violet.soft':         'rgb(62,30,132)',
  'color.violet.default':      'rgb(165,100,255)',
  'color.violet.bold':         'rgb(210,178,255)',
  'color.violet.on-container': 'rgb(240,230,255)',

  'color.blue.container':    'rgb(8,18,55)',
  'color.blue.soft':         'rgb(20,52,148)',
  'color.blue.default':      'rgb(65,132,255)',
  'color.blue.bold':         'rgb(158,196,255)',
  'color.blue.on-container': 'rgb(220,234,255)',

  'color.cyan.container':    'rgb(0,26,26)',
  'color.cyan.soft':         'rgb(0,78,76)',
  'color.cyan.default':      'rgb(0,220,214)',
  'color.cyan.bold':         'rgb(100,238,234)',
  'color.cyan.on-container': 'rgb(200,252,250)',

  'color.green.container':    'rgb(5,26,18)',
  'color.green.soft':         'rgb(12,76,50)',
  'color.green.default':      'rgb(40,202,126)',
  'color.green.bold':         'rgb(118,228,175)',
  'color.green.on-container': 'rgb(208,248,232)',

  'color.orange.container':    'rgb(40,12,4)',
  'color.orange.soft':         'rgb(112,36,14)',
  'color.orange.default':      'rgb(255,108,60)',
  'color.orange.bold':         'rgb(255,175,148)',
  'color.orange.on-container': 'rgb(255,228,220)',

  'color.yellow.container':    'rgb(30,24,0)',
  'color.yellow.soft':         'rgb(88,70,0)',
  'color.yellow.default':      'rgb(255,220,22)',
  'color.yellow.bold':         'rgb(255,238,128)',
  'color.yellow.on-container': 'rgb(255,252,218)',

  'color.red.container':    'rgb(40,8,10)',
  'color.red.soft':         'rgb(102,26,30)',
  'color.red.default':      'rgb(240,88,92)',
  'color.red.bold':         'rgb(255,154,157)',
  'color.red.on-container': 'rgb(255,228,229)',

  'color.ui.surface':         'rgb(17,17,17)',
  'color.ui.interface-light': 'rgb(26,26,26)',
  'color.ui.interface-dark':  'rgb(37,37,37)',
  'color.ui.divider':         'rgba(255,255,255,0.10)',
  'color.ui.divider-dashed':  'rgba(255,255,255,0.20)',
  'color.ui.overlay':         'rgba(0,0,0,0.88)',

  'color.text.primary':   'rgb(239,239,239)',
  'color.text.secondary': 'rgba(255,255,255,0.59)',
  'color.text.tertiary':  'rgba(255,255,255,0.32)',
  'color.text.link':      'rgb(90,148,255)',
} as const;