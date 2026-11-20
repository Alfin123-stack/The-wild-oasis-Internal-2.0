"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import { HiArrowTrendingDown, HiArrowTrendingUp } from "react-icons/hi2";
import Sparkline from "./Sparkline";

const StyledStat = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-top: 2px solid var(--color-bronze);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-subtle);
  padding: clamp(1.4rem, 1rem + 1vw, 2rem) var(--card-pad);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
`;

const Title = styled.h5`
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-grey-500);
`;

const Body = styled.div`
  /* Nilai di atas, sparkline di bawah: tinggi kartu seragam di semua lebar */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.8rem;

  & > svg { flex-shrink: 0; max-width: 100%; }
`;

const Value = styled.p`
  /* Angka KPI: sans tabular (bukan serif) supaya antar kartu mudah dibandingkan */
  font-family: var(--font-sans);
  font-size: var(--text-kpi);
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-grey-800);
  font-variant-numeric: tabular-nums;
`;

const Trend = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-caption);
  font-weight: 600;
  color: ${(p) => (p.$dir === "up" ? "var(--status-ok-fg)" : p.$dir === "down" ? "var(--status-alert-fg)" : "var(--color-grey-500)")};

  & svg { width: 1.6rem; height: 1.6rem; }
  & span { font-weight: 400; color: var(--color-grey-500); }
`;

// delta: perubahan relatif (0.12 = +12%) atau null bila tidak ada pembanding
function Stat({ title, value, delta, spark }) {
  const dir = delta == null ? "flat" : delta > 0.0049 ? "up" : delta < -0.0049 ? "down" : "flat";
  return (
    <StyledStat>
      <Title>{title}</Title>
      <Body>
        <Value>{value}</Value>
        <Sparkline values={spark} />
      </Body>
      <Trend $dir={dir}>
        {dir === "up" && <HiArrowTrendingUp />}
        {dir === "down" && <HiArrowTrendingDown />}
        {delta == null ? "No prior data" : `${delta > 0 ? "+" : ""}${Math.round(delta * 100)}%`}
        {delta != null && <span>vs previous period</span>}
      </Trend>
    </StyledStat>
  );
}

export default Stat;
