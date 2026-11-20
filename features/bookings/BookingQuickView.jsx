"use client";

/* eslint-disable react/prop-types */
import Link from "next/link";
import styled from "styled-components";
import Button from "../../ui/Button";
import Heading from "../../ui/Heading";
import StatusBadge from "../../ui/StatusBadge";
import useCheckout from "../check-in-out/useCheckout";
import { formatCurrency } from "../../utils/helpers";
import { fmtUTC } from "../../utils/dates";
import { media } from "../../styles/breakpoints";

const Box = styled.div`
  width: 44rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Dl = styled.dl`
  display: grid;
  grid-template-columns: 11rem minmax(0, 1fr);
  gap: 0.8rem 1.6rem;
  font-size: var(--text-body);

  & dt { color: var(--color-grey-500); }
  & dd { font-weight: 500; }

  ${media.down.medium} {
    grid-template-columns: 9rem minmax(0, 1fr);
    gap: 0.8rem 1.2rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  ${media.down.medium} { flex-direction: column-reverse; & > * { width: 100%; } }
`;

function BookingQuickView({ booking, onClose }) {
  const { updateCheckout, isCheckout } = useCheckout();
  const { id, status, guests, cabins, startDate, endDate, numNights, numGuests, totalPrice, isPaid } = booking;
  return (
    <Box>
      <div>
        <Heading as="h2">{guests?.fullName}</Heading>
        <div style={{ marginTop: 8 }}>
          <StatusBadge status={status} />
        </div>
      </div>
      <Dl>
        <dt>Cabin</dt>
        <dd>{cabins?.name}</dd>
        <dt>Stay</dt>
        <dd>
          {fmtUTC(startDate)} &rarr; {fmtUTC(endDate)} ({numNights} nights)
        </dd>
        <dt>Guests</dt>
        <dd>{numGuests}</dd>
        <dt>Total</dt>
        <dd>
          {formatCurrency(totalPrice)} · {isPaid ? "Paid" : "Pay at property"}
        </dd>
      </Dl>
      <Actions>
        <Button variation="secondary" as={Link} href={`/bookings/${id}`} onClick={onClose}>
          Details
        </Button>
        {status === "unconfirmed" && (
          <Button variation="accent" as={Link} href={`/check-in/${id}`} onClick={onClose}>
            Check in
          </Button>
        )}
        {status === "checked-in" && (
          <Button disabled={isCheckout} onClick={() => updateCheckout(id, { onSuccess: onClose })}>
            Check out
          </Button>
        )}
      </Actions>
    </Box>
  );
}

export default BookingQuickView;
