"use client";

import { useState } from "react";
import styled, { css } from "styled-components";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import { TimelineSkeleton } from "../../ui/Skeleton";
import Filter from "../../ui/Filter";
import BookingQuickView from "./BookingQuickView";
import useCabins from "../cabins/useCabins";
import { useTimeline } from "./useTimeline";
import { addDaysKey, diffDays, fmtUTC, keyToDate, todayKey } from "../../utils/dates";
import { useSearchParams } from "next/navigation";
import { media } from "../../styles/breakpoints";

const LABEL_W = "var(--timeline-label-w)";

const Toolbar = styled.div`
  --timeline-label-w: 14rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.2rem;
`;

const Range = styled.p`
  font-family: var(--font-serif);
  font-size: var(--text-title);
  font-weight: 700;
  margin: 0 0.8rem;
`;

const Legend = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 2.4rem;
  font-size: var(--text-caption);
  color: var(--color-grey-600);

  & li { display: flex; align-items: center; gap: 0.8rem; }
  & i { width: 2.2rem; height: 1rem; border-radius: 2px; display: inline-block; }
`;

const Hint = styled.p`
  display: none;
  font-size: var(--text-caption);
  color: var(--color-grey-500);
  ${media.down.expanded} { display: block; }
`;

const Scroll = styled.div`
  --timeline-label-w: 14rem;
  ${media.down.medium} { --timeline-label-w: 9.6rem; }
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-cards);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-subtle);
  overflow-x: auto;
`;

const Inner = styled.div`
  min-width: ${(p) => `calc(${LABEL_W} + ${p.$span} * 4.6rem)`};
`;

const HeadRow = styled.div`
  display: grid;
  grid-template-columns: ${LABEL_W} 1fr;
  border-bottom: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-50);
  position: sticky;
  top: 0;
  z-index: 2;
`;

const Corner = styled.div`
  padding: 1.2rem 1.6rem;
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-grey-500);
  position: sticky;
  left: 0;
  background-color: var(--color-grey-50);
  z-index: 3;
`;

const Days = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$span}, 1fr);
`;

const DayHead = styled.div`
  text-align: center;
  padding: 0.8rem 0;
  font-size: 1.1rem;
  color: var(--color-grey-500);
  border-left: 1px solid var(--color-grey-200);

  & b { display: block; font-size: 1.5rem; font-weight: 600; color: var(--color-grey-800); }

  ${(p) => p.$weekend && css`background-color: var(--color-grey-100);`}
  ${(p) => p.$today && css`
    background-color: var(--color-action-fill);
    color: var(--color-action-text);
    & b { color: var(--color-action-text); }
  `}
`;

const CabinRow = styled.div`
  display: grid;
  grid-template-columns: ${LABEL_W} 1fr;
  border-bottom: 1px solid var(--color-grey-200);
  &:last-child { border-bottom: none; }
`;

const CabinName = styled.div`
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: var(--color-grey-0);
  padding: 1.4rem 1.6rem;
  border-right: 1px solid var(--color-grey-200);
  font-weight: 600;
  font-size: var(--text-body);
  min-width: 0;
  overflow-wrap: anywhere;

  & span { display: block; font-weight: 400; font-size: var(--text-caption); color: var(--color-grey-500); }

  ${media.down.medium} { padding: 1.2rem 1rem; font-size: 1.3rem; }
`;

const Track = styled.div`
  position: relative;
  min-height: 5.6rem;
  @media (pointer: coarse) { min-height: 6.4rem; }
  display: grid;
  grid-template-columns: repeat(${(p) => p.$span}, 1fr);
`;

const Cell = styled.div`
  border-left: 1px solid var(--color-grey-200);
  ${(p) => p.$weekend && css`background-color: var(--color-grey-50);`}
  ${(p) => p.$today && css`background-color: var(--color-bronze-tint);`}
`;

const BAR = {
  unconfirmed: css`
    background-color: var(--status-unconfirmed-bg);
    color: var(--status-unconfirmed-fg);
    border: 1px dashed var(--status-unconfirmed-fg);
  `,
  arriving: css`
    background-color: var(--status-arriving-bg);
    color: var(--status-arriving-fg);
    border: 1px solid var(--status-arriving-fg);
  `,
  overdue: css`
    background-color: var(--status-alert-bg);
    color: var(--status-alert-fg);
    border: 1px dashed var(--status-alert-fg);
  `,
  inhouse: css`
    background-color: var(--color-sidebar);
    color: #fffdf9;
    border: 1px solid var(--color-sidebar);
  `,
  out: css`
    background-color: var(--status-out-bg);
    color: var(--status-out-fg);
    border: 1px solid var(--color-grey-300);
  `,
};

const Bar = styled.button`
  position: absolute;
  top: 0.6rem;
  bottom: 0.6rem;
  left: ${(p) => p.$left}%;
  width: calc(${(p) => p.$width}% - 2px);
  border-radius: var(--radius-sm);
  padding: 0 0.9rem;
  font-size: var(--text-caption);
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${(p) => BAR[p.$kind]}

  &:hover { filter: brightness(0.96); box-shadow: var(--shadow-sm); }
  ${(p) => p.$clipL && "border-top-left-radius: 0; border-bottom-left-radius: 0;"}
  ${(p) => p.$clipR && "border-top-right-radius: 0; border-bottom-right-radius: 0;"}
`;

function kindOf(b, today) {
  if (b.status === "checked-in") return "inhouse";
  if (b.status === "checked-out") return "out";
  const d = diffDays(b.startDate, keyToDate(today));
  if (d === 0) return "arriving";
  if (d < 0) return "overdue";
  return "unconfirmed";
}

function BookingTimeline() {
  const params = useSearchParams();
  const span = params.get("span") === "28" ? 28 : 14;
  const today = todayKey();
  const [start, setStart] = useState(() => addDaysKey(todayKey(), -2));

  const from = keyToDate(start);
  const to = keyToDate(addDaysKey(start, span - 1));
  const { bookings, isPending } = useTimeline(from, to);
  const { cabins, isLoading } = useCabins({ all: true });

  const days = Array.from({ length: span }, (_, i) => addDaysKey(start, i));
  const dow = (k) => keyToDate(k).getUTCDay();

  return (
    <>
      <Toolbar>
        <Button variation="secondary" size="small" onClick={() => setStart((s) => addDaysKey(s, -7))} aria-label="Previous week">
          <HiChevronLeft />
        </Button>
        <Button variation="secondary" size="small" onClick={() => setStart(addDaysKey(todayKey(), -2))}>
          Today
        </Button>
        <Button variation="secondary" size="small" onClick={() => setStart((s) => addDaysKey(s, 7))} aria-label="Next week">
          <HiChevronRight />
        </Button>
        <Range>
          {fmtUTC(from, { month: "short", day: "numeric" })} &ndash; {fmtUTC(to, { month: "short", day: "numeric", year: "numeric" })}
        </Range>
        <div style={{ marginLeft: "auto", maxWidth: "100%" }}>
          <Filter
            filterField="span"
            options={[
              { value: "14", label: "14 days" },
              { value: "28", label: "28 days" },
            ]}
          />
        </div>
      </Toolbar>

      <Legend aria-label="Legend">
        <li><i style={{ background: "var(--status-unconfirmed-bg)", border: "1px dashed var(--status-unconfirmed-fg)" }} /> Unconfirmed</li>
        <li><i style={{ background: "var(--status-arriving-bg)", border: "1px solid var(--status-arriving-fg)" }} /> Arriving today</li>
        <li><i style={{ background: "var(--color-sidebar)" }} /> In-house</li>
        <li><i style={{ background: "var(--status-out-bg)", border: "1px solid var(--color-grey-300)" }} /> Checked out</li>
        <li><i style={{ background: "var(--status-alert-bg)", border: "1px dashed var(--status-alert-fg)" }} /> Overdue arrival</li>
      </Legend>

      <Hint>Swipe sideways to see other dates.</Hint>

      {isPending || isLoading ? (
        <TimelineSkeleton />
      ) : (
        <Modal>
          <Scroll>
            <Inner $span={span}>
              <HeadRow>
                <Corner>Cabin</Corner>
                <Days $span={span}>
                  {days.map((k) => (
                    <DayHead key={k} $today={k === today} $weekend={[0, 6].includes(dow(k))}>
                      {fmtUTC(keyToDate(k), { weekday: "short" })}
                      <b>{keyToDate(k).getUTCDate()}</b>
                    </DayHead>
                  ))}
                </Days>
              </HeadRow>

              {(cabins || []).map((cabin) => {
                const rows = (bookings || []).filter((b) => b.cabins?.id === cabin.id);
                return (
                  <CabinRow key={cabin.id}>
                    <CabinName>
                      {cabin.name}
                      <span>up to {cabin.maxCapacity} guests</span>
                    </CabinName>
                    <Track $span={span}>
                      {days.map((k) => (
                        <Cell key={k} $today={k === today} $weekend={[0, 6].includes(dow(k))} />
                      ))}
                      {rows.map((b) => {
                        // bar dari tengah hari check-in ke tengah hari check-out
                        const s = diffDays(b.startDate, from) + 0.5;
                        const e = diffDays(b.endDate, from) + 0.5;
                        const cs = Math.max(0, s);
                        const ce = Math.min(span, e);
                        if (ce <= cs) return null;
                        return (
                          <Modal.Open key={b.id} opens={`q-${b.id}`}>
                            <Bar
                              $kind={kindOf(b, today)}
                              $left={(cs / span) * 100}
                              $width={((ce - cs) / span) * 100}
                              $clipL={s < 0}
                              $clipR={e > span}
                              title={`${b.guests?.fullName} (${b.status})`}>
                              {b.guests?.fullName}
                            </Bar>
                          </Modal.Open>
                        );
                      })}
                    </Track>
                  </CabinRow>
                );
              })}
            </Inner>
          </Scroll>

          {(bookings || []).map((b) => (
            <Modal.Window key={b.id} names={`q-${b.id}`}>
              <BookingQuickView booking={b} />
            </Modal.Window>
          ))}
        </Modal>
      )}
    </>
  );
}

export default BookingTimeline;
