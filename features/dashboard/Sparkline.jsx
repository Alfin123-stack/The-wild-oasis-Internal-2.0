"use client";

/* eslint-disable react/prop-types */
// Sparkline SVG kecil tanpa dependensi.
function Sparkline({ values, width = 110, height = 34 }) {
  if (!values?.length) return null;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  const pts = values.map((v, i) => [i * step, height - 3 - (v / max) * (height - 8)]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polygon points={area} fill="var(--color-bronze)" opacity="0.12" />
      <polyline points={line} fill="none" stroke="var(--color-bronze)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default Sparkline;
