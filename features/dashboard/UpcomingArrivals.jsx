"use client";

import Link from "next/link";
import styled from "styled-components";
import Card from "../../ui/Card";
import { ListSkeleton } from "../../ui/Skeleton";
import StatusBadge from "../../ui/StatusBadge";
import { useTimeline } from "../bookings/useTimeline";
import { formatCurrency } from "../../utils/helpers";
import { media } from "../../styles/breakpoints";
import { addDaysKey, fmtUTC, keyToDate, todayKey } from "../../utils/dates";

const Row = styled(Link)`
  display: grid;
  grid-template-columns: 5.6rem minmax(0, 1fr) auto auto;
  gap: 1.6rem;
  align-items: center;
  padding: 1.2rem 0;
  font-size: 1.3rem;

  &:not(:last-child) { border-bottom: 1px solid var(--color-grey-200); }
  &:hover { background-color: var(--color-grey-50); }

  ${media.down.medium} {
    grid-template-columns: 5.2rem minmax(0, 1fr) auto;
    gap: 1.2rem;
    & > :last-child { display: none; }
  }
`;

const Date_ = styled.div`
  text-align: center;
  border: 1px solid var(--color-grey-200);
  padding: 0.4rem 0;

  & b { display: block; font-family: var(--font-serif); font-size: var(--text-heading); line-height: 1.1; }
  & span { font-size: 1.1rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-grey-500); }
`;

const Who = styled.div`
  min-width: 0;
  & b { display: block; font-weight: 600; }
  & span { color: var(--color-grey-500); font-size: var(--text-caption); }
`;

const None = styled.p`
  text-align: center;
  color: var(--color-grey-500);
  padding: 2.4rem 0;
`;

function UpcomingArrivals() {
  const start = keyToDate(todayKey());
  const to = keyToDate(addDaysKey(todayKey(), 7));
  const { bookings, isPending } = useTimeline(start, to);
  const upcoming = (bookings || [])
    .filter((b) => b.status === "unconfirmed" && new Date(b.startDate) >= start)
    .slice(0, 6);

  return (
    <Card title="Upcoming arrivals" hint="Next 7 days, not yet checked in">
      {isPending ? (
        <ListSkeleton rows={3} />
      ) : upcoming.length ? (
        <div>
          {upcoming.map((b) => (
            <Row key={b.id} href={`/bookings/${b.id}`}>
              <Date_>
                <b>{fmtUTC(b.startDate, { day: "2-digit" })}</b>
                <span>{fmtUTC(b.startDate, { month: "short" })}</span>
              </Date_>
              <Who>
                <b>{b.guests?.fullName}</b>
                <span>
                  Cabin {b.cabins?.name} · {b.numNights} nights · {b.numGuests} guests
                </span>
              </Who>
              <StatusBadge status={b.status} />
              <span style={{ fontWeight: 600 }}>{formatCurrency(b.totalPrice)}</span>
            </Row>
          ))}
        </div>
      ) : (
        <None>No arrivals waiting in the next 7 days.</None>
      )}
    </Card>
  );
}

export default UpcomingArrivals;
