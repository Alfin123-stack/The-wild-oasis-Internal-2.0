import { createGlobalStyle } from "styled-components";

/*
 * Design system: "Lodge Ledger" — hospitality hangat + logika status PMS.
 * - Canvas krem, kartu hampir putih, satu aksen perunggu, sidebar navy.
 * - Judul serif (Caudex), body sans (Instrument Sans), angka tabular.
 * - Radius kecil (2 / 4px), bayangan sangat lembut, garis tipis hangat.
 * - Warna status = tindakan (ala Mews): unconfirmed oranye, arriving biru,
 *   in-house navy, checked-out abu hangat, alert merah bata.
 *
 * Nama variable lama (--color-grey-*, --color-brand-*, --border-radius-*) tetap
 * ada sebagai alias supaya komponen lama ikut berganti tampilan.
 */
const GlobalStyles = createGlobalStyle`
:root {
  /* Font di-host sendiri lewat @fontsource (lihat app/layout.jsx). */
  --font-sans: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-serif: 'Source Serif 4 Variable', 'Source Serif 4', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  /* alias lama */
  --font-inter: var(--font-sans);
  --font-satoshi: var(--font-serif);
  --font-geist-mono: var(--font-mono);

  /*
   * Skala tipografi (1rem = 10px). Token fluid memakai clamp() berbasis rem dengan
   * rasio max/min <= 2,5 supaya tetap lolos zoom 200% (WCAG 1.4.4).
   * Isi tabel/UI (body) sengaja TIDAK dibesarkan di layar lebar: ini alat kerja, bukan landing page.
   */
  --text-caption: clamp(1.1rem, 1.07rem + 0.1vw, 1.2rem);
  --text-body: 1.4rem;
  --text-body-lg: clamp(1.5rem, 1.46rem + 0.12vw, 1.6rem);
  --text-title: clamp(1.6rem, 1.52rem + 0.25vw, 1.8rem);
  --text-heading: clamp(2rem, 1.85rem + 0.5vw, 2.4rem);
  --text-page: clamp(2.2rem, 1.95rem + 0.8vw, 2.8rem);
  --text-kpi: clamp(2.4rem, 2rem + 1.2vw, 3.2rem);
  /* alias lama */
  --text-subheading: var(--text-heading);
  --text-heading-sm: var(--text-heading);
  --text-heading-lg: var(--text-kpi);

  /*
   * Density: pointer halus (mouse) = compact; pointer kasar (sentuh) = target >= 44px.
   * WCAG 2.5.8 minimal 24px; 44px (Apple / WCAG 2.5.5) dipakai untuk layar sentuh.
   */
  --control-h: 3.4rem;
  --control-h-sm: 2.8rem;
  --control-h-lg: 4rem;
  --control-pad-x: 1.6rem;
  --row-pad-y: 1.2rem;
  --page-pad-x: 4rem;
  --page-pad-y: 3.6rem;
  --section-gap: 3.2rem;
  --card-pad: 2.4rem;

  @media (pointer: coarse) {
    --control-h: 4.4rem;
    --control-h-sm: 4.4rem;
    --control-h-lg: 4.8rem;
    --row-pad-y: 1.4rem;
  }

  /* Breakpoint: compact < 600 | medium 600-839 | expanded 840-1199 | large >= 1200 */
  @media (max-width: 599.98px) {
    --page-pad-x: 1.6rem;
    --page-pad-y: 2rem;
    --section-gap: 2.4rem;
    --card-pad: 1.6rem;
  }
  @media (min-width: 600px) and (max-width: 839.98px) {
    --page-pad-x: 2.4rem;
    --page-pad-y: 2.8rem;
    --section-gap: 2.8rem;
    --card-pad: 2rem;
  }
  @media (min-width: 840px) and (max-width: 1199.98px) {
    --page-pad-x: 3.2rem;
  }

  /* Gerak: masuk sedikit lebih lambat dari keluar; hover <= 120ms. Hanya opacity/transform. */
  --dur-fast: 120ms;
  --dur-enter: 220ms;
  --dur-exit: 140ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --enter-distance: 6px;

  /* Layout */
  --page-max-width: 1320px;
  --sidebar-width: 25rem;
  --sidebar-width-collapsed: 7.2rem;

  /* Radius */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-lg: 4px;
  --radius-xl: 6px;
  --radius-full: 9999px;
  --radius-tags: 2px;
  --radius-cards: 4px;
  --radius-inputs: 2px;
  --radius-buttons: 2px;
  --radius-largecards: 4px;
  --border-radius-tiny: 2px;
  --border-radius-sm: 2px;
  --border-radius-md: 4px;
  --border-radius-lg: 4px;

  &, &.light-mode {
    color-scheme: light;
    --skeleton-base: #ece6d8;
    --skeleton-shine: rgba(255, 253, 249, 0.75);
    --color-canvas: #f9f6f0;
    --color-card: #fffdf9;
    --color-sidebar: #1f2a44;
    --color-sidebar-hover: #2a3757;
    --color-sidebar-text: #e9e3d4;
    --color-sidebar-muted: #9aa3bb;

    --color-ink: #1f2a44;
    --color-bronze: #a4793f;        /* dekoratif: garis, ikon */
    --color-bronze-strong: #8a6431; /* teks & fill (kontras AA) */
    --color-bronze-hover: #6f4f27;
    --color-bronze-tint: #f3e8d2;

    /* Grey -> neutral hangat (ink navy untuk teks) */
    --color-grey-0: #fffdf9;
    --color-grey-50: #faf6ee;
    --color-grey-100: #f3eee2;
    --color-grey-200: #e6dfd0;
    --color-grey-300: #d3c9b4;
    --color-grey-400: #9096a6;
    --color-grey-500: #626a80;
    --color-grey-600: #4d5670;
    --color-grey-700: #2d3752;
    --color-grey-800: #1f2a44;
    --color-grey-900: #131a2e;

    /* Status (logika Mews) */
    --status-unconfirmed-fg: #b45309;
    --status-unconfirmed-bg: #fff1e0;
    --status-arriving-fg: #2f5d9e;
    --status-arriving-bg: #e4edf9;
    --status-inhouse-fg: #1f2a44;
    --status-inhouse-bg: #dfe3ee;
    --status-out-fg: #6b6558;
    --status-out-bg: #eeeadf;
    --status-alert-fg: #b42318;
    --status-alert-bg: #fde9e6;
    --status-ok-fg: #2f6b4f;
    --status-ok-bg: #e3f1e9;

    /* Tint badge lama (nama dipertahankan) */
    --color-blue-100: #e4edf9;
    --color-blue-700: #2f5d9e;
    --color-green-100: #e3f1e9;
    --color-green-700: #2f6b4f;
    --color-yellow-100: #fff1e0;
    --color-yellow-700: #b45309;
    --color-silver-100: #eeeadf;
    --color-silver-700: #6b6558;
    --color-indigo-100: #dfe3ee;
    --color-indigo-700: #1f2a44;
    --color-red-100: #fde9e6;
    --color-red-700: #b42318;
    --color-red-800: #912018;

    --color-brand-50: #faf3e4;
    --color-brand-100: #f3e8d2;
    --color-brand-200: #e6d3ac;
    --color-brand-500: #a4793f;
    --color-brand-600: #8a6431;
    --color-brand-700: #6f4f27;
    --color-brand-800: #553c1e;
    --color-brand-900: #3b2a15;

    --color-action-fill: #1f2a44;
    --color-action-text: #fffdf9;
    --color-action-hover: #2d3a5c;
    --color-accent-fill: #8a6431;
    --color-on-accent: #fffdf9;
    --color-accent-hover: #6f4f27;
    --color-input-border: #d3c9b4;
    --color-input-text: #1f2a44;
    --color-danger-border: #f0c4bd;
    --color-electric-blue: #8a6431; /* alias lama: fokus/spinner/link */
    --color-tint-blue: #f3e8d2;     /* alias lama: item aktif */
    --color-tint-yellow: #fff1e0;
    --color-surface-muted: #faf6ee;

    --shadow-subtle: 0 1px 2px rgba(31, 42, 68, 0.06);
    --shadow-sm: 0 2px 6px rgba(31, 42, 68, 0.08);
    --shadow-md: 0 8px 24px rgba(31, 42, 68, 0.12);
    --shadow-lg: 0 18px 40px rgba(31, 42, 68, 0.16);
    --shadow-subtle-2: 0 20px 50px rgba(31, 42, 68, 0.22);

    --backdrop-color: rgba(31, 42, 68, 0.35);
    --image-grayscale: 0;
    --image-opacity: 100%;
  }

  &.dark-mode {
    color-scheme: dark;
    --skeleton-base: #2f2a22;
    --skeleton-shine: rgba(255, 245, 225, 0.07);
    --color-canvas: #16130f;
    --color-card: #1f1b15;
    --color-sidebar: #0f0d0a;
    --color-sidebar-hover: #1c1812;
    --color-sidebar-text: #eadfc9;
    --color-sidebar-muted: #8f8573;

    --color-ink: #f1ebdf;
    --color-bronze: #d4a45f;
    --color-bronze-strong: #d9ab68;
    --color-bronze-hover: #e8c088;
    --color-bronze-tint: #33291a;

    --color-grey-0: #1f1b15;
    --color-grey-50: #25201a;
    --color-grey-100: #2b261f;
    --color-grey-200: #3a342a;
    --color-grey-300: #524a3c;
    --color-grey-400: #938b79;
    --color-grey-500: #a9a190;
    --color-grey-600: #c6bda9;
    --color-grey-700: #e0d7c4;
    --color-grey-800: #f1ebdf;
    --color-grey-900: #faf6ee;

    --status-unconfirmed-fg: #f5b061;
    --status-unconfirmed-bg: #3a2713;
    --status-arriving-fg: #8db6ee;
    --status-arriving-bg: #172a45;
    --status-inhouse-fg: #d5dcf0;
    --status-inhouse-bg: #2a3454;
    --status-out-fg: #b3ab99;
    --status-out-bg: #302b23;
    --status-alert-fg: #f59a8f;
    --status-alert-bg: #3f1b17;
    --status-ok-fg: #8fd0ae;
    --status-ok-bg: #173226;

    --color-blue-100: #172a45;
    --color-blue-700: #8db6ee;
    --color-green-100: #173226;
    --color-green-700: #8fd0ae;
    --color-yellow-100: #3a2713;
    --color-yellow-700: #f5b061;
    --color-silver-100: #302b23;
    --color-silver-700: #b3ab99;
    --color-indigo-100: #2a3454;
    --color-indigo-700: #d5dcf0;
    --color-red-100: #3f1b17;
    --color-red-700: #f59a8f;
    --color-red-800: #f7b5ac;

    --color-brand-50: #2a2114;
    --color-brand-100: #33291a;
    --color-brand-200: #4a3b22;
    --color-brand-500: #d4a45f;
    --color-brand-600: #d9ab68;
    --color-brand-700: #e8c088;
    --color-brand-800: #f0d3a8;
    --color-brand-900: #f7e4c6;

    --color-action-fill: #e9dfc9;
    --color-action-text: #16130f;
    --color-action-hover: #f6efdf;
    --color-accent-fill: #c99448;
    --color-on-accent: #1a1610;
    --color-accent-hover: #d9ab68;
    --color-input-border: #524a3c;
    --color-input-text: #f1ebdf;
    --color-danger-border: #6b2a23;
    --color-electric-blue: #d9ab68;
    --color-tint-blue: #33291a;
    --color-tint-yellow: #3a2713;
    --color-surface-muted: #25201a;

    --shadow-subtle: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 18px 40px rgba(0, 0, 0, 0.55);
    --shadow-subtle-2: 0 20px 50px rgba(0, 0, 0, 0.6);

    --backdrop-color: rgba(0, 0, 0, 0.6);
    --image-grayscale: 8%;
    --image-opacity: 92%;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  transition: background-color 0.2s, border-color 0.2s;
}

html {
  font-size: 62.5%; /* 1rem = 10px, tetap mengikuti ukuran font bawaan browser */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans);
  color: var(--color-grey-800);
  background-color: var(--color-canvas);
  transition: color 0.2s, background-color 0.2s;
  min-height: 100vh;
  line-height: 1.5;
  font-size: 1.4rem;
  -webkit-font-smoothing: antialiased;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

input, button, textarea, select {
  font: inherit;
  color: inherit;
}

/* iOS memperbesar halaman bila input < 16px saat fokus; di layar sentuh pakai 16px. */
@media (pointer: coarse) {
  input, select, textarea { font-size: 1.6rem !important; }
}

/* Judul: serif hanya untuk h1/h2/brand. Angka & label tetap sans tabular. */
.num, [data-num] { font-variant-numeric: tabular-nums lining-nums; }

/* ---------- Gerak ---------- */
@keyframes enter-up {
  from { opacity: 0; transform: translateY(var(--enter-distance)); }
  to { opacity: 1; transform: none; }
}

/* Halaman / blok yang baru muncul. */
.enter { animation: enter-up var(--dur-enter) var(--ease-out) both; }

/* Anak-anak langsung muncul bertahap (maks. 6 item pertama, selisih 30ms; sisanya bersamaan). */
.enter-list > * { animation: enter-up var(--dur-enter) var(--ease-out) both; animation-delay: 180ms; }
.enter-list > :nth-child(1) { animation-delay: 0ms; }
.enter-list > :nth-child(2) { animation-delay: 30ms; }
.enter-list > :nth-child(3) { animation-delay: 60ms; }
.enter-list > :nth-child(4) { animation-delay: 90ms; }
.enter-list > :nth-child(5) { animation-delay: 120ms; }
.enter-list > :nth-child(6) { animation-delay: 150ms; }

/*
 * Ganti tema. Browser modern: View Transitions (cross-fade snapshot ~250ms).
 * Browser lama: kelas .theme-switching menyetel transisi warna serempak ke SEMUA elemen
 * selama pergantian, sehingga elemen dengan transition sendiri (mis. tombol) tidak berkedip.
 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 250ms;
  animation-timing-function: ease;
}
:root.theme-switching,
:root.theme-switching *,
:root.theme-switching *::before,
:root.theme-switching *::after {
  transition: background-color 250ms ease, color 250ms ease, border-color 250ms ease,
    fill 250ms ease, stroke 250ms ease, box-shadow 250ms ease !important;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}

button { cursor: pointer; }
*:disabled { cursor: not-allowed; }

select:disabled,
input:disabled {
  background-color: var(--color-grey-100);
  color: var(--color-grey-500);
}

input:focus,
button:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--color-bronze);
  outline-offset: 1px;
}

button:focus:not(:focus-visible) { outline: none; }
button:has(svg) { line-height: 0; }

a { color: inherit; text-decoration: none; }
ul { list-style: none; }

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
  hyphens: auto;
}

code, kbd, samp {
  font-family: var(--font-mono);
  font-size: 0.92em;
}

img {
  max-width: 100%;
  filter: grayscale(var(--image-grayscale)) opacity(var(--image-opacity));
}
`;

export default GlobalStyles;
