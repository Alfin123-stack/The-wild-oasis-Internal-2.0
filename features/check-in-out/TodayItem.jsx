"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import Link from "next/link";
import { fmtUTC } from "../../utils/dates";
import { Flag } from "../../ui/Flag";
import Button from "../../ui/Button";
import CheckoutButton from "./CheckoutButton";

const Item = styled.li`
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto;
  gap: 1.2rem;
  align-items: center;
  padding: 1.2rem 0;
  font-size: 1.3rem;

  &:not(:last-child) { border-bottom: 1px solid var(--color-grey-200); }
`;

const Who = styled.div`
  min-width: 0;

  & b { display: block; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  & span { color: var(--color-grey-500); font-size: 1.2rem; }
`;

const FlagSlot = styled.span`
  width: 2rem;
  height: 1.4rem;
`;

// mode: arrivals | inhouse | departures
function TodayItem({ activity, mode }) {
  const { id, guests, cabins, numNights, endDate } = activity;
  return (
    <Item>
      <FlagSlot>{guests?.countryFlag && <Flag src={guests.countryFlag} alt={guests.nationality || ""} />}</FlagSlot>
      <Who>
        <b>{guests?.fullName}</b>
        <span>
          {cabins?.name ? `Cabin ${cabins.name} · ` : ""}
          {mode === "inhouse" ? `out ${fmtUTC(endDate, { month: "short", day: "2-digit" })}` : `${numNights} nights`}
        </span>
      </Who>
      {mode === "arrivals" && (
        <Button size="small" variation="accent" as={Link} href={`/check-in/${id}`}>
          Check in
        </Button>
      )}
      {mode === "departures" && <CheckoutButton bookingId={id} />}
      {mode === "inhouse" && (
        <Button size="small" variation="ghost" as={Link} href={`/bookings/${id}`}>
          View
        </Button>
      )}
    </Item>
  );
}

export default TodayItem;
