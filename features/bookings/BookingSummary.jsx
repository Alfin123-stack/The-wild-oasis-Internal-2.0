"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import Card from "../../ui/Card";
import { formatCurrency } from "../../utils/helpers";
import { fmtUTC } from "../../utils/dates";

const Dl = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem 1.6rem;
  font-size: var(--text-body);

  & dt { color: var(--color-grey-500); }
  & dd { font-weight: 500; text-align: right; min-width: 0; }
`;

const Rule = styled.hr`
  border: none;
  border-top: 1px solid var(--color-grey-200);
`;

const Heading = styled.h3`
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-grey-500);
`;

const Balance = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1.2rem;
  padding: 1.6rem 1.8rem;
  border-radius: var(--radius-cards);
  border: 1px solid ${(p) => (p.$paid ? "var(--status-ok-fg)" : "var(--status-unconfirmed-fg)")};
  background-color: ${(p) => (p.$paid ? "var(--status-ok-bg)" : "var(--status-unconfirmed-bg)")};
  color: ${(p) => (p.$paid ? "var(--status-ok-fg)" : "var(--status-unconfirmed-fg)")};

  & small { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
  & b { font-family: var(--font-sans); font-weight: 600; font-size: var(--text-kpi); }
`;

// extraBreakfast: simulasi tambahan sarapan (dipakai di langkah check-in)
function BookingSummary({ booking, extraBreakfast = 0 }) {
  const { startDate, endDate, numNights, numGuests, cabinPrice, extrasPrice, totalPrice, hasBreakfast, isPaid, cabins } = booking;
  const total = totalPrice + extraBreakfast;
  const breakfast = extrasPrice + extraBreakfast;
  const showBreakfast = hasBreakfast || extraBreakfast > 0;
  return (
    <Card title="Summary">
      <Dl>
        <dt>Cabin</dt>
        <dd>{cabins?.name}</dd>
        <dt>Arrival</dt>
        <dd>{fmtUTC(startDate, { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}</dd>
        <dt>Departure</dt>
        <dd>{fmtUTC(endDate, { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}</dd>
        <dt>Nights</dt>
        <dd>{numNights}</dd>
        <dt>Guests</dt>
        <dd>{numGuests}</dd>
        <dt>Breakfast</dt>
        <dd>{showBreakfast ? "Included" : "No"}</dd>
      </Dl>
      <Rule />
      <Heading>Price</Heading>
      <Dl>
        <dt>Cabin ({numNights} nights)</dt>
        <dd>{formatCurrency(cabinPrice)}</dd>
        {showBreakfast && (
          <>
            <dt>Breakfast</dt>
            <dd>{formatCurrency(breakfast)}</dd>
          </>
        )}
        <dt style={{ color: "var(--color-grey-800)", fontWeight: 600 }}>Total</dt>
        <dd style={{ fontWeight: 700 }}>{formatCurrency(total)}</dd>
      </Dl>
      <Balance $paid={isPaid && extraBreakfast === 0}>
        <small>{isPaid && extraBreakfast === 0 ? "Paid in full" : "Balance due"}</small>
        <b>{isPaid && extraBreakfast === 0 ? formatCurrency(0) : formatCurrency(total)}</b>
      </Balance>
    </Card>
  );
}

export default BookingSummary;
