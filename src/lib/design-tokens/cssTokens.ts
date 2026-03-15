/**
 * cssTokens.ts — Runtime theme resolver
 *
 * No values are hardcoded here. Everything is derived from the canonical
 * colorTokensLight / colorTokensDark exported by designTokens.ts — the
 * single source of truth for the entire Throw Clay token system.
 *
 * This file only re-shapes the flat color-token map into the compact
 * TCTokens object consumed by ThemeContext throughout the UI.
 */

import { colorTokensLight, colorTokensDark } from './designTokens';

// ─── TCTokens interface ───────────────────────────────────────────────────────
// Only the color tokens actively used by the documentation UI itself.
// The full palette (color.success.*, color.pink.*, …) is consumed directly
// from colorTokensLight / colorTokensDark in ColorSection.tsx.

export interface TCTokens {
  // color.ui
  surface:        string; // color.ui.surface
  interfaceLight: string; // color.ui.interface-light
  interfaceDark:  string; // color.ui.interface-dark
  divider:        string; // color.ui.divider
  dividerDashed:  string; // color.ui.divider-dashed
  overlay:        string; // color.ui.overlay
  // color.text
  textPrimary:    string; // color.text.primary
  textSecondary:  string; // color.text.secondary
  textTertiary:   string; // color.text.tertiary
  textLink:       string; // color.text.link — hyperlinks, link-variant buttons
  // color.brand (subset used by the doc UI itself)
  brand:          string; // color.brand.default
  brandContainer: string; // color.brand.container
  brandBold:      string; // color.brand.bold
  // color.error (needed for destructive component variants)
  errorDefault:   string; // color.error.default — destructive button fill, invalid border
  errorContainer: string; // color.error.container — destructive badge background
  errorBold:      string; // color.error.bold — destructive button hover fill
}

type ColorMap = typeof colorTokensLight;

function resolve(c: ColorMap): TCTokens {
  return {
    surface:        c['color.ui.surface'],
    interfaceLight: c['color.ui.interface-light'],
    interfaceDark:  c['color.ui.interface-dark'],
    divider:        c['color.ui.divider'],
    dividerDashed:  c['color.ui.divider-dashed'],
    overlay:        c['color.ui.overlay'],
    textPrimary:    c['color.text.primary'],
    textSecondary:  c['color.text.secondary'],
    textTertiary:   c['color.text.tertiary'],
    textLink:       c['color.text.link'],
    brand:          c['color.brand.default'],
    brandContainer: c['color.brand.container'],
    brandBold:      c['color.brand.bold'],
    errorDefault:   c['color.error.default'],
    errorContainer: c['color.error.container'],
    errorBold:      c['color.error.bold'],
  };
}

export const lightTokens: TCTokens = resolve(colorTokensLight);
export const darkTokens:  TCTokens = resolve(colorTokensDark);

// Backward-compat export (light theme default)
export const TC = lightTokens;