"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import Heading from "../../ui/Heading";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useDarkMode } from "../../context/DarkModeContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const ChartBox = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-subtle);
  padding: var(--card-pad);
  min-width: 0;

  & > *:first-child {
    margin-bottom: 1.6rem;
  }

`;

const Body = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
  gap: 1.6rem 2.4rem;
  align-items: center;
`;

const Donut = styled.div`
  position: relative;
  width: 100%;
  max-width: 30rem;
  margin: 0 auto;

  & .center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    line-height: 1.1;
  }
  & .center b { font-size: var(--text-kpi); font-weight: 600; color: var(--color-grey-800); }
  & .center span { font-size: var(--text-caption); color: var(--color-grey-500); margin-top: 0.2rem; }
`;

/* Legenda = tabel kecil: warna, rentang, jumlah, persen + batang proporsi. Terbaca tanpa hover. */
const Rows = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
`;

const RowItem = styled.li`
  display: grid;
  grid-template-columns: 0.9rem minmax(0, 1fr) auto 4.4rem;
  align-items: center;
  column-gap: 1rem;
  font-size: var(--text-body);
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  & i { width: 0.9rem; height: 0.9rem; border-radius: 50%; background: var(--dot); }
  & .name { color: var(--color-grey-700); }
  & .count { color: var(--color-grey-500); font-size: var(--text-caption); }
  & .pct { text-align: right; font-weight: 600; color: var(--color-grey-800); }
  & .bar {
    grid-column: 2 / -1;
    height: 4px;
    border-radius: 2px;
    background: var(--color-grey-100);
    overflow: hidden;
    margin-top: 0.5rem;
  }
  & .bar > span { display: block; height: 100%; width: var(--w); background: var(--dot); border-radius: 2px; }
`;

const Insight = styled.p`
  margin-top: 1.2rem;
  font-size: var(--text-body);
  color: var(--color-grey-600);
  & b { color: var(--color-grey-800); font-weight: 600; }
`;

const LABELS = [
  "1 night",
  "2 nights",
  "3 nights",
  "4-5 nights",
  "6-7 nights",
  "8-14 nights",
  "15-21 nights",
  "21+ nights",
];

// Satu hue per sisi: krem -> perunggu -> navy (makin lama = makin gelap)
const LIGHT = ["#e8dcc0", "#d9c28f", "#c4a063", "#a4793f", "#6f5a46", "#4a5a7c", "#2f3d63", "#1f2a44"];
const DARK = ["#5c4a2e", "#7d6236", "#a37e43", "#c99448", "#d9ab68", "#8fa6d4", "#b6c4e6", "#dbe3f5"];

const makeStart = (colors) => LABELS.map((duration, i) => ({ duration, value: 0, color: colors[i] }));
const startDataLight = makeStart(LIGHT);
const startDataDark = makeStart(DARK);

function prepareData(startData, stays) {
  // A bit ugly code, but sometimes this is what it takes when working with real data 😅

  function incArrayValue(arr, field) {
    return arr.map((obj) =>
      obj.duration === field ? { ...obj, value: obj.value + 1 } : obj
    );
  }

  const data = stays
    .reduce((arr, cur) => {
      const num = cur.numNights;
      if (num === 1) return incArrayValue(arr, "1 night");
      if (num === 2) return incArrayValue(arr, "2 nights");
      if (num === 3) return incArrayValue(arr, "3 nights");
      if ([4, 5].includes(num)) return incArrayValue(arr, "4-5 nights");
      if ([6, 7].includes(num)) return incArrayValue(arr, "6-7 nights");
      if (num >= 8 && num <= 14) return incArrayValue(arr, "8-14 nights");
      if (num >= 15 && num <= 21) return incArrayValue(arr, "15-21 nights");
      if (num >= 21) return incArrayValue(arr, "21+ nights");
      return arr;
    }, startData)
    .filter((obj) => obj.value > 0);

  return data;
}

// Warna teks label di dalam irisan, dipilih dari kecerahan warna irisan.
function labelColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.55 ? "#1f2a44" : "#ffffff";
}

const RAD = Math.PI / 180;

function DurationChart({ confirmedStays }) {
  const { isDarkMode } = useDarkMode();
  const compact = useMediaQuery("(max-width: 599.98px)");
  const startData = isDarkMode ? startDataDark : startDataLight;

  const data = prepareData(startData, confirmedStays);
  const total = data.reduce((a, d) => a + d.value, 0);
  const withPct = data.map((d) => ({ ...d, pct: total ? (d.value / total) * 100 : 0 }));
  const top = withPct.reduce((m, d) => (d.value > (m?.value ?? -1) ? d : m), null);
  const avg = total ? confirmedStays.reduce((a, s) => a + (s.numNights || 0), 0) / total : 0;

  const inner = compact ? 54 : 62;
  const outer = compact ? 84 : 92;

  // Persentase di dalam irisan (hanya irisan >= 7% agar tidak menumpuk)
  function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, payload }) {
    if (payload.pct < 7) return null;
    const r = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    return (
      <text x={x} y={y} fill={labelColor(payload.color)} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {Math.round(payload.pct)}%
      </text>
    );
  }

  return (
    <ChartBox>
      <Heading as="h2">Length of stay</Heading>
      {total === 0 ? (
        <Insight>No guest stays in this period.</Insight>
      ) : (
        <>
          <Body>
            <Donut role="img" aria-label={`Length of stay distribution across ${total} stays`}>
              <ResponsiveContainer width="100%" height={compact ? 210 : 230}>
                <PieChart>
                  <Pie
                    data={withPct}
                    nameKey="duration"
                    dataKey="value"
                    innerRadius={inner}
                    outerRadius={outer}
                    paddingAngle={2}
                    label={renderLabel}
                    labelLine={false}
                    isAnimationActive={false}>
                    {withPct.map((entry) => (
                      <Cell key={entry.duration} fill={entry.color} stroke="var(--color-grey-0)" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, _n, item) => [`${v} stays (${Math.round(item.payload.pct)}%)`, item.payload.duration]}
                    contentStyle={{
                      backgroundColor: "var(--color-grey-0)",
                      border: "1px solid var(--color-grey-200)",
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                    itemStyle={{ color: "var(--color-grey-700)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="center" aria-hidden="true">
                <b>{total}</b>
                <span>stays</span>
              </div>
            </Donut>

            <Rows>
              {withPct.map((d) => (
                <RowItem key={d.duration} style={{ "--dot": d.color, "--w": `${d.pct}%` }}>
                  <i />
                  <span className="name">{d.duration}</span>
                  <span className="count">{d.value}</span>
                  <span className="pct">{Math.round(d.pct)}%</span>
                  <div className="bar"><span /></div>
                </RowItem>
              ))}
            </Rows>
          </Body>
          <Insight>
            Most common: <b>{top.duration}</b> ({Math.round(top.pct)}% of {total} stays). Average stay{" "}
            <b>{avg.toFixed(1)} nights</b>.
          </Insight>
        </>
      )}
    </ChartBox>
  );
}

export default DurationChart;
