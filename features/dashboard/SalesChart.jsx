"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import DashboardBox from "./DashboardBox";
import Heading from "../../ui/Heading";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { formatCurrency } from "../../utils/helpers.js";

const StyledSalesChart = styled(DashboardBox)`
  & .recharts-cartesian-grid-horizontal line {
    stroke: var(--color-grey-200);
  }
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1.2rem;

  flex-wrap: wrap;

  & small { font-size: var(--text-caption); color: var(--color-grey-500); }
`;

const Summary = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 1.2rem 2rem;
  margin: 1.2rem 0 1.6rem;

  & > div { min-width: 0; }
  & dt { font-size: var(--text-caption); color: var(--color-grey-500); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
  & dd { margin: 0.2rem 0 0; font-size: var(--text-heading); font-weight: 600; color: var(--color-grey-800); line-height: 1.2; }
  & dd small { display: block; margin-top: 0.2rem; font-size: var(--text-caption); font-weight: 400; color: var(--color-grey-500); }
`;

const Delta = styled.span`
  font-weight: 600;
  white-space: nowrap;
  color: ${(p) => (p.$dir === "up" ? "var(--status-ok-fg)" : p.$dir === "down" ? "var(--status-alert-fg)" : "var(--color-grey-500)")};
`;

const money = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `$${v}`);

function totalFor(bookings, date) {
  return bookings
    .filter((b) => isSameDay(date, new Date(b.created_at)))
    .reduce((acc, cur) => acc + cur.totalPrice, 0);
}

function SalesChart({ bookings, previousBookings = [], numDays }) {
  const allDates = eachDayOfInterval({
    start: subDays(new Date(), numDays - 1),
    end: new Date(),
  });

  // periode sebelumnya disejajarkan per indeks hari
  const data = allDates.map((date) => ({
    label: format(date, "MMM dd"),
    totalSales: totalFor(bookings, date),
    previous: totalFor(previousBookings, subDays(date, numDays)),
  }));

  const compact = useMediaQuery("(max-width: 599.98px)");

  // Ringkasan supaya makna grafik terbaca tanpa hover
  // Total memakai rumus yang sama dengan kartu KPI "Sales" (jumlah seluruh booking pada periode),
  // supaya angka di kartu dan di grafik selalu sama.
  const total = bookings.reduce((a, b) => a + b.totalPrice, 0);
  const prevTotal = previousBookings.reduce((a, b) => a + b.totalPrice, 0);
  const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null;
  const peak = data.reduce((m, d) => (d.totalSales > (m?.totalSales ?? 0) ? d : m), null);
  const avgPerDay = numDays ? total / numDays : 0;
  // Label sumbu minimal 11px (12px di layar lebar).
  const tick = { fill: "var(--color-grey-500)", fontSize: compact ? 11 : 12 };

  return (
    <StyledSalesChart>
      <Head>
        <Heading as="h2">Sales</Heading>
        <small>
          {format(allDates.at(0), "MMM dd, yyyy")} &mdash; {format(allDates.at(-1), "MMM dd, yyyy")}
        </small>
      </Head>

      <Summary>
        <div>
          <dt>Total sales</dt>
          <dd>
            {formatCurrency(total)}
            <small>
              {change !== null ? (
                <>
                  <Delta $dir={change > 0.5 ? "up" : change < -0.5 ? "down" : "flat"}>
                    {change > 0.5 ? "▲" : change < -0.5 ? "▼" : "–"} {Math.abs(change).toFixed(0)}%
                  </Delta>{" "}
                  vs {formatCurrency(prevTotal)} previous period
                </>
              ) : (
                "No previous period to compare"
              )}
            </small>
          </dd>
        </div>
        <div>
          <dt>Avg / day</dt>
          <dd>{formatCurrency(avgPerDay)}</dd>
        </div>
        <div>
          <dt>Best day</dt>
          <dd>{peak ? formatCurrency(peak.totalSales) : "–"}<small>{peak ? peak.label : "No sales yet"}</small></dd>
        </div>
      </Summary>

      <ResponsiveContainer width="100%" height={compact ? 220 : 320}>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} minTickGap={compact ? 40 : 24} />
          <YAxis tick={tick} tickLine={false} axisLine={false} tickFormatter={money} width={compact ? 44 : 56} />
          <Tooltip
            formatter={(v) => `$${Number(v).toLocaleString("en")}`}
            contentStyle={{
              backgroundColor: "var(--color-grey-0)",
              border: "1px solid var(--color-grey-200)",
              borderRadius: 4,
              fontSize: 13,
              color: "var(--color-grey-800)",
            }}
          />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: compact ? 11 : 12 }} />
          <Line
            type="monotone"
            dataKey="previous"
            name="Previous period"
            stroke="var(--color-grey-400)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
          />
          {peak && <ReferenceDot x={peak.label} y={peak.totalSales} r={4} fill="var(--color-bronze)" stroke="var(--color-grey-0)" strokeWidth={2} />}
          <Area
            type="monotone"
            dataKey="totalSales"
            name="This period"
            stroke="var(--color-bronze)"
            strokeWidth={2}
            fill="var(--color-bronze)"
            fillOpacity={0.14}
          />
        </AreaChart>
      </ResponsiveContainer>
    </StyledSalesChart>
  );
}

export default SalesChart;
