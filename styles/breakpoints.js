// Satu sumber breakpoint untuk seluruh aplikasi (kelas ukuran jendela ala Material 3).
//   compact  < 600   HP portrait
//   medium   600-839 tablet portrait
//   expanded 840-1199 tablet landscape / laptop kecil
//   large    >= 1200 desktop
// Pemakaian di styled-components:  ${media.down.expanded} { ... }  atau  ${media.up.large} { ... }
export const BP = { medium: 600, expanded: 840, large: 1200 };

export const media = {
  up: {
    medium: `@media (min-width: ${BP.medium}px)`,
    expanded: `@media (min-width: ${BP.expanded}px)`,
    large: `@media (min-width: ${BP.large}px)`,
  },
  down: {
    medium: `@media (max-width: ${BP.medium - 0.02}px)`,
    expanded: `@media (max-width: ${BP.expanded - 0.02}px)`,
    large: `@media (max-width: ${BP.large - 0.02}px)`,
  },
  between: {
    expandedLarge: `@media (min-width: ${BP.expanded}px) and (max-width: ${BP.large - 0.02}px)`,
  },
  touch: "@media (pointer: coarse)",
};
