"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import Link from "next/link";
import { HiArrowDownOnSquare, HiArrowUpOnSquare, HiEye, HiTrash, HiXCircle } from "react-icons/hi2";
import { useRouter } from "next/navigation";

import StatusBadge from "../../ui/StatusBadge";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";

import useCheckout from "../check-in-out/useCheckout";
import useCancelBooking from "./useCancelBooking";
import useUser from "../authentication/useUser";
import useDeleteBooking from "./useDeleteBooking";
import { formatCurrency } from "../../utils/helpers";
import { diffDays, fmtUTC, todayKey, keyToDate } from "../../utils/dates";

const Cabin = styled.div`
  font-size: 1.3rem;
  overflow-wrap: normal;
  font-weight: 500;
  font-family: var(--font-mono);
`;

const Stacked = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;

  & > :first-child { font-weight: 600; }
  & > :last-child { color: var(--color-grey-500); font-size: var(--text-caption); }
`;

const GuestLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: var(--control-h-sm);
  font-weight: 600;
  &:hover { color: var(--color-bronze-strong); text-decoration: underline; text-underline-offset: 3px; }
`;

const Amount = styled.div`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

function relative(startDate) {
  const d = diffDays(startDate, keyToDate(todayKey()));
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  return d > 0 ? `In ${d} days` : `${-d} days ago`;
}

function BookingRow({ booking }) {
  const {
    id: bookingId,
    startDate,
    endDate,
    numNights,
    totalPrice,
    status,
    isPaid,
    guests,
    cabins,
  } = booking;
  const { updateCheckout, isCheckout } = useCheckout();
  const { isPending, deleteBooking } = useDeleteBooking();
  const { isPending: isCancelling, cancelBooking } = useCancelBooking();
  const { isAdmin } = useUser();
  const router = useRouter();

  return (
    <Table.Row areas={'"guest menu" "stay status" "cabin total"'}>
      <Stacked data-area="guest">
        <GuestLink href={`/bookings/${bookingId}`}>{guests?.fullName}</GuestLink>
        <span>{guests?.email}</span>
      </Stacked>

      <Cabin data-area="cabin" data-label="Cabin">{cabins?.name}</Cabin>

      <Stacked data-area="stay">
        <span>
          {fmtUTC(startDate, { month: "short", day: "2-digit" })} &rarr; {fmtUTC(endDate, { month: "short", day: "2-digit", year: "numeric" })}
        </span>
        <span>
          {numNights} nights · {relative(startDate)}
        </span>
      </Stacked>

      <div data-area="status" data-end>
        <StatusBadge status={status} />
      </div>

      <Stacked data-area="total" data-end>
        <Amount>{formatCurrency(totalPrice)}</Amount>
        <span>{isPaid ? "Paid" : "Pay at property"}</span>
      </Stacked>

      <div data-area="menu" data-end>
      <Menus>
        <Menus.Toggle id={bookingId} />
        <Modal>
          <Menus.List id={bookingId}>
            <Menus.Button onClick={() => router.push(`/bookings/${bookingId}`)}>
              <HiEye /> See details
            </Menus.Button>
            {status === "unconfirmed" && (
              <Menus.Button onClick={() => router.push(`/check-in/${bookingId}`)}>
                <HiArrowDownOnSquare /> Check in
              </Menus.Button>
            )}
            {status === "checked-in" && (
              <Menus.Button disabled={isCheckout} onClick={() => updateCheckout(bookingId)}>
                <HiArrowUpOnSquare /> Check out
              </Menus.Button>
            )}
            {status === "unconfirmed" && (
              <Modal.Open opens="cancel">
                <Menus.Button>
                  <HiXCircle /> Cancel booking
                </Menus.Button>
              </Modal.Open>
            )}
            {isAdmin && status !== "checked-in" && (
              <Modal.Open opens="delete">
                <Menus.Button>
                  <HiTrash /> Delete
                </Menus.Button>
              </Modal.Open>
            )}
          </Menus.List>
          <Modal.Window names="cancel">
            <ConfirmDelete
              verb="Cancel"
              resourceName="booking"
              cancelLabel="Keep booking"
              message="The guest will be marked as cancelled and the cabin is free for those dates again. This cannot be reversed."
              disabled={isCancelling}
              onConfirm={() => cancelBooking(bookingId)}
            />
          </Modal.Window>
          <Modal.Window names="delete">
            <ConfirmDelete
              resourceName="booking"
              message="The booking moves to the trash. You can undo for a few seconds after deleting."
              disabled={isPending}
              onConfirm={() => deleteBooking(bookingId)}
            />
          </Modal.Window>
        </Modal>
      </Menus>
      </div>
    </Table.Row>
  );
}

export default BookingRow;
