"use client";

import { useState } from "react";
import styled from "styled-components";
import { HiTrash, HiXCircle } from "react-icons/hi2";
import { useRouter } from "next/navigation";

import BookingSummary from "./BookingSummary";
import Heading from "../../ui/Heading";
import StatusBadge from "../../ui/StatusBadge";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";
import Card from "../../ui/Card";
import Tabs from "../../ui/Tabs";
import Empty from "../../ui/Empty";
import { DetailSkeleton } from "../../ui/Skeleton";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import { Flag } from "../../ui/Flag";

import { useMoveBack } from "../../hooks/useMoveBack";
import useBooking from "./useBooking";
import useCheckout from "../check-in-out/useCheckout";
import useDeleteBooking from "./useDeleteBooking";
import useCancelBooking from "./useCancelBooking";
import useUser from "../authentication/useUser";
import DraftMessage from "./DraftMessage";
import { formatCurrency } from "../../utils/helpers";
import { fmtUTC } from "../../utils/dates";
import { media } from "../../styles/breakpoints";

const Top = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.6rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 1.2rem;
  ${media.down.medium} {
    width: 100%;
    & > button { flex: 1; }
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  color: var(--color-grey-500);
  font-size: 1.3rem;

  & code { background-color: var(--color-grey-100); padding: 0.2rem 0.8rem; border-radius: 2px; color: var(--color-grey-700); }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(28rem, 34rem) minmax(0, 1fr);
  gap: clamp(1.2rem, 0.8rem + 1.2vw, 2.4rem);
  align-items: start;

  & > :first-child { position: sticky; top: 0; }

  ${media.down.expanded} {
    grid-template-columns: minmax(0, 1fr);
    & > :first-child { position: static; }
  }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0;
`;

const Dl = styled.dl`
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  gap: 1.4rem 2rem;
  font-size: var(--text-body);

  & dt { color: var(--color-grey-500); }
  & dd { font-weight: 500; display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }

  /* HP: label di atas nilai, bukan dua kolom sempit */
  ${media.down.medium} {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.2rem;
    & dt { font-size: var(--text-caption); text-transform: uppercase; letter-spacing: 0.08em; }
    & dd { margin-bottom: 1rem; }
  }
`;

const Log = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  border-left: 1px solid var(--color-grey-300);
  margin-left: 0.6rem;
  padding-left: 2.4rem;

  & li { position: relative; font-size: 1.4rem; }
  & li::before {
    content: "";
    position: absolute;
    left: -2.95rem;
    top: 0.5rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: var(--color-bronze);
  }
  & li[data-pending="true"]::before { background-color: var(--color-grey-300); }
  & small { display: block; color: var(--color-grey-500); font-size: 1.2rem; }
`;

const DangerRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  ${media.down.medium} { & > button { width: 100%; } }
`;

const Danger = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: var(--card-pad);
  border: 1px solid var(--color-danger-border);
  ${media.down.medium} { & > button { width: 100%; } }
  background-color: var(--status-alert-bg);
  border-radius: var(--radius-cards);

  & h3 { color: var(--status-alert-fg); font-size: 1.5rem; }
  & p { color: var(--color-grey-600); font-size: 1.3rem; margin-top: 0.2rem; }
`;

function BookingDetail() {
  const [tab, setTab] = useState("cabin");
  const { isLoading, booking } = useBooking();
  const { updateCheckout, isCheckout } = useCheckout();
  const { isPending, deleteBooking } = useDeleteBooking();
  const { isPending: isCancelling, cancelBooking } = useCancelBooking();
  const { isAdmin } = useUser();
  const moveBack = useMoveBack();
  const router = useRouter();

  if (isLoading) return <DetailSkeleton />;
  if (!booking) return <Empty resource="booking" />;

  const { status, id, guests, cabins, observations, created_at, startDate, endDate, numGuests } = booking;
  const done = status === "checked-in" || status === "checked-out";

  return (
    <>
      <Top>
        <div>
          <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
        </div>
        <Title>
          <div>
            <Heading as="h1">{guests?.fullName}</Heading>
            <Meta>
              <code>#{String(id).slice(-6).toUpperCase()}</code>
              <StatusBadge status={status} />
              <span>
                {fmtUTC(startDate, { month: "short", day: "numeric" })} &rarr; {fmtUTC(endDate, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </Meta>
          </div>
          <Actions>
            {status === "unconfirmed" && (
              <Button variation="accent" size="large" onClick={() => router.push(`/check-in/${id}`)}>
                Check in
              </Button>
            )}
            {status === "checked-in" && (
              <Button size="large" disabled={isCheckout} onClick={() => updateCheckout(id)}>
                Check out
              </Button>
            )}
            <DraftMessage booking={booking} />
          </Actions>
        </Title>
      </Top>

      <Layout>
        <BookingSummary booking={booking} />

        <Panel>
          <Card flush>
            <div style={{ padding: "0 var(--card-pad)" }}>
              <Tabs
                label="Booking sections"
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: "cabin", label: "Cabin" },
                  { value: "guest", label: "Guest" },
                  { value: "notes", label: "Notes" },
                  { value: "activity", label: "Activity" },
                ]}
              />
            </div>
            <div style={{ padding: "0.4rem var(--card-pad) var(--card-pad)" }}>
              {tab === "cabin" && (
                <Dl>
                  <dt>Cabin</dt>
                  <dd>{cabins?.name}</dd>
                  <dt>Capacity</dt>
                  <dd>Up to {cabins?.maxCapacity} guests</dd>
                  <dt>Rate</dt>
                  <dd>
                    {formatCurrency(cabins?.regularPrice || 0)}
                    {cabins?.discount > 0 && ` (discount ${formatCurrency(cabins.discount)})`} per night
                  </dd>
                  {cabins?.description && (
                    <>
                      <dt>About</dt>
                      <dd style={{ fontWeight: 400 }}>{cabins.description}</dd>
                    </>
                  )}
                </Dl>
              )}
              {tab === "guest" && (
                <Dl>
                  <dt>Name</dt>
                  <dd>
                    {guests?.countryFlag && <Flag src={guests.countryFlag} alt={guests.nationality || ""} />}
                    {guests?.fullName}
                    {numGuests > 1 && ` + ${numGuests - 1} guests`}
                  </dd>
                  <dt>Email</dt>
                  <dd>{guests?.email}</dd>
                  <dt>Nationality</dt>
                  <dd>{guests?.nationality || "—"}</dd>
                  <dt>National ID</dt>
                  <dd>{guests?.nationalID || "—"}</dd>
                </Dl>
              )}
              {tab === "notes" && (
                <p style={{ fontSize: "1.4rem", color: observations ? "var(--color-grey-800)" : "var(--color-grey-500)" }}>
                  {observations || "No notes on this booking."}
                </p>
              )}
              {tab === "activity" && (
                <Log>
                  <li>
                    Booking created
                    <small>{fmtUTC(created_at, { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</small>
                  </li>
                  <li>
                    Arrival scheduled
                    <small>{fmtUTC(startDate)}</small>
                  </li>
                  <li data-pending={!done}>
                    {done ? "Checked in" : "Awaiting check-in"}
                    {!done && <small>Not yet checked in</small>}
                  </li>
                  <li data-pending={status !== "checked-out"}>
                    {status === "checked-out" ? "Checked out" : "Awaiting check-out"}
                    <small>Departure {fmtUTC(endDate)}</small>
                  </li>
                </Log>
              )}
            </div>
          </Card>

          {(status === "unconfirmed" || (isAdmin && status !== "checked-in")) && (
            <Danger>
              {status === "unconfirmed" && (
                <DangerRow>
                  <div>
                    <h3>Cancel this booking</h3>
                    <p>Marks the booking as cancelled and frees the cabin for those dates.</p>
                  </div>
                  <Modal>
                    <Modal.Open opens="cancel">
                      <Button variation="danger">
                        <HiXCircle /> Cancel booking
                      </Button>
                    </Modal.Open>
                    <Modal.Window names="cancel">
                      <ConfirmDelete
                        verb="Cancel"
                        resourceName="booking"
                        cancelLabel="Keep booking"
                        message="The guest will be marked as cancelled and the cabin is free for those dates again. This cannot be reversed."
                        disabled={isCancelling}
                        onConfirm={() => cancelBooking(id)}
                      />
                    </Modal.Window>
                  </Modal>
                </DangerRow>
              )}
              {isAdmin && status !== "checked-in" && (
                <DangerRow>
                  <div>
                    <h3>Delete this booking</h3>
                    <p>Moves the booking to the trash. You can undo for a few seconds after deleting.</p>
                  </div>
                  <Modal>
                    <Modal.Open opens="delete">
                      <Button variation="danger">
                        <HiTrash /> Delete booking
                      </Button>
                    </Modal.Open>
                    <Modal.Window names="delete">
                      <ConfirmDelete
                        resourceName="booking"
                        message="The booking moves to the trash. You can undo for a few seconds after deleting."
                        disabled={isPending}
                        onConfirm={() => deleteBooking(id, { onSuccess: () => router.replace("/bookings") })}
                      />
                    </Modal.Window>
                  </Modal>
                </DangerRow>
              )}
            </Danger>
          )}
        </Panel>
      </Layout>
    </>
  );
}

export default BookingDetail;
