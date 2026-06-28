---
name: Frosted Metal Enterprise
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system is engineered for an ultra-premium ERP experience, balancing technical precision with executive sophistication. It targets high-end mobile retail operations, demanding a UI that feels both like a high-performance instrument and a luxury dashboard.

The aesthetic follows a **Modern Frosted Metal** direction. This style utilizes deep, monochromatic charcoal surfaces paired with high-energy accents. It leverages glassmorphism not for playfulness, but to create a sense of depth and material hierarchy. The emotional response is one of absolute control, reliability, and modern prestige.

## Colors
The palette is rooted in a "Midnight Charcoal" foundation, ensuring a low-strain, high-focus environment for long-duration ERP tasks.

- **Primary (Electric Cobalt):** Used for core actions, focus states, and primary navigational elements. It represents the "engine" of the system.
- **Secondary (Vivid Emerald):** Reserved for growth indicators, completed transactions, and "In Stock" statuses.
- **Tertiary (Saffron Gold):** A specialized accent for "Udhaar" (credit) tracking, high-priority alerts, and premium membership ribbons.
- **Surface Strategy:** Backgrounds utilize the deepest charcoal (#0f172a). Containers use a slightly lighter slate (#1e293b) with 60% opacity when frosted effects are applied.

## Typography
The typographic scale emphasizes technical clarity. **Space Grotesk** is used for headings and data-heavy displays (like IMEIs or Stock Counts) to provide a geometric, futuristic edge. **Plus Jakarta Sans** handles all long-form reading and UI labels, ensuring the interface remains approachable and professional.

For mobile views, display sizes scale down aggressively to maintain information density without horizontal scrolling. All uppercase labels should have slight letter spacing to improve legibility against dark backgrounds.

## Layout & Spacing
The system uses a **Fluid Grid** with fixed maximum widths for desktop dashboard views to prevent data-stretching. 

- **Grid:** 12-column system for desktop, 4-column for mobile.
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **Density:** As an ERP, the system supports a "Compact" mode where vertical padding is reduced by 4px (1 unit) to allow more rows of inventory to be visible at once.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Backdrop Blurs** rather than traditional heavy shadows.

1.  **Level 0 (Base):** Solid #0f172a.
2.  **Level 1 (Cards):** Surface #1e293b with a 1px stroke of 10% white to simulate a metal edge.
3.  **Level 2 (Modals/Overlays):** Glassmorphism effect. Background: `rgba(30, 41, 59, 0.7)` with a 12px blur.
4.  **Shadows:** Use extremely soft, large-radius ambient shadows (Color: `rgba(0,0,0,0.4)`, Blur: 24px) only for floating elements like dropdowns or active modals.

## Shapes
The shape language is "Sophisticated Softness." A standard radius of **8px (Level 2)** is applied to most components (inputs, cards, buttons). This softens the technical "edge" of the Space Grotesk font, making the ERP feel modern and curated rather than purely industrial. 

Tags and Status Badges (like "In Stock" or "Udhaar") use **Pill-shaped (Level 3)** rounding to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons use a solid Electric Cobalt fill. Secondary buttons use a "Ghost" style with a 1px Electric Cobalt border. All buttons have a subtle inner-glow on top to reinforce the metal aesthetic.
- **Input Fields:** Darker than the card background (#0a0f1d). On focus, the border glows with a 2px Electric Cobalt stroke and a faint outer neon bloom.
- **Udhaar Ribbons:** Specialized badges using the Saffron Gold color, placed in the top-right corner of customer or invoice cards.
- **Data Tables:** Rows use a subtle hover state (5% white overlay). "Vivid Emerald" is used for positive cash flow and "Electric Cobalt" for stock entries.
- **Glass Overlays:** Used for mobile navigation bars and filtered views, ensuring the content beneath is visible but blurred, maintaining context.