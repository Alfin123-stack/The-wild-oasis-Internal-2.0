"use client";

import { useState } from "react";
import styled from "styled-components";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useTimeline } from "../bookings/useTimeline";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  & strong {
    font-family: var(--font-serif);
    font-size: var(--text-title);
    font-weight: 700;
  }
`;

const Nav = styled.button`
  background: none;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-buttons);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--control-h-sm);
  min-height: var(--control-h-sm);
  padding: 0.3rem;
  & svg { width: 1.6rem; height: 1.6rem; color: var(--color-grey-600); }
  &:hover { background-color: var(--color-grey-100); }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
`;

const Dow = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-grey-500);
  padding-bottom: 0.4rem;
`;

const Day = styled.div`
  position: relative;
  font-size: 1.3rem;
  padding: 0.7rem 0;
  border-radius: var(--radius-buttons);
  color: ${(p) => (p.$muted ? "var(--color-grey-500)" : "var(--color-grey-900)")};
  background-color: ${(p) => (p.$today ? "var(--color-action-fill)" : "transparent")};
  ${(p) => p.$today && "color: var(--color-action-text); font-weight: 600;"}

  & i {
    position: absolute;
    left: 50%;
    bottom: 2px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    transform: translateX(-50%);
    background-color: ${(p) => (p.$today ? "var(--color-action-text)" : "var(--color-bronze)")};
  }
`;

const Legend = styled.p`
  font-size: var(--text-caption);
  color: var(--color-grey-500);
  display: flex;
  align-items: center;
  gap: 0.6rem;

  & i { width: 6px; height: 6px; border-radius: 50%; background-color: var(--color-bronze); }
`;

function MiniCalendar() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const gridStart = startOfWeek(month, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const { bookings } = useTimeline(gridStart, addDays(gridEnd, 1));
  const arrivals = (bookings || []).map((b) => new Date(b.startDate));
  const today = new Date();

  return (
    <Wrap>
      <Head>
        <strong>{format(month, "MMMM yyyy")}</strong>
        <div style={{ display: "flex", gap: 6 }}>
          <Nav onClick={() => setMonth((m) => subMonths(m, 1))} aria-label="Previous month">
            <HiChevronLeft />
          </Nav>
          <Nav onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month">
            <HiChevronRight />
          </Nav>
        </div>
      </Head>
      <Grid>
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <Dow key={d}>{d}</Dow>
        ))}
        {days.map((d) => (
          <Day key={d.toISOString()} $muted={!isSameMonth(d, month)} $today={isSameDay(d, today)}>
            {format(d, "d")}
            {arrivals.some((a) => isSameDay(a, d)) && <i />}
          </Day>
        ))}
      </Grid>
      <Legend>
        <i /> Arrival
      </Legend>
    </Wrap>
  );
}

export default MiniCalendar;
