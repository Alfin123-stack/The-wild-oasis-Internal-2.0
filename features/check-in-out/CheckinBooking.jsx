"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

import BookingSummary from "../bookings/BookingSummary";
import PageHeader from "../../ui/PageHeader";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";
import Checkbox from "../../ui/Checkbox";
import Stepper from "../../ui/Stepper";
import { DetailSkeleton } from "../../ui/Skeleton";
import Empty from "../../ui/Empty";
import { Flag } from "../../ui/Flag";

import { useMoveBack } from "../../hooks/useMoveBack";
import useBooking from "../bookings/useBooking";
import useCheckin from "./useCheckin";
import useSettings from "../settings/useSettings";
import { formatCurrency } from "../../utils/helpers";
import { fmtUTC } from "../../utils/dates";
import { media } from "../../styles/breakpoints";

const STEPS = ["Guest", "Extras", "Payment", "Confirm"];

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(28rem, 34rem);
  gap: clamp(1.2rem, 0.8rem + 1.2vw, 2.4rem);
  align-items: start;

  ${media.down.expanded} { grid-template-columns: minmax(0, 1fr); }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(1.6rem, 1rem + 1.2vw, 2.4rem);
  min-width: 0;
`;

const Lead = styled.p`
  font-size: var(--text-body);
  color: var(--color-grey-500);
  max-width: 52rem;
`;

const Dl = styled.dl`
  display: grid;
  grid-template-columns: 14rem minmax(0, 1fr);
  gap: 1.2rem 2rem;
  font-size: var(--text-body-lg);

  & dt { color: var(--color-grey-500); }
  & dd { font-weight: 500; display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }

  ${media.down.medium} {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.2rem;
    & dt { font-size: var(--text-caption); text-transform: uppercase; letter-spacing: 0.08em; }
    & dd { margin-bottom: 1rem; }
  }
`;

const Offer = styled.div`
  border: 1px solid var(--color-bronze);
  background-color: var(--color-bronze-tint);
  padding: var(--card-pad);
  border-radius: var(--radius-cards);

  & b { font-family: var(--font-serif); font-size: var(--text-title); }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;

  /* < 840px: aksi utama selalu terjangkau ibu jari (menempel di bawah area gulir) */
  ${media.down.expanded} {
    position: sticky;
    bottom: calc(-1 * var(--page-pad-y) - 2.4rem);
    z-index: 5;
    margin: 0 calc(-1 * var(--page-pad-x));
    padding: 1.2rem var(--page-pad-x) calc(1.2rem + env(safe-area-inset-bottom));
    background-color: var(--color-canvas);
    border-top: 1px solid var(--color-grey-200);
    flex-wrap: nowrap;
  }
`;

const Right = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  ${media.down.medium} { flex: 1; & > button { flex: 1; } }
`;

function CheckinBooking() {
  const [step, setStep] = useState(0);
  const [confirmPaid, setConfirmPaid] = useState(false);
  const [addBreakfast, setAddBreakfast] = useState(false);
  const moveBack = useMoveBack();
  const { booking, isLoading } = useBooking();
  const { updateCheckin, isCheckin } = useCheckin();
  const { isLoading: isLoadingSettings, settings } = useSettings();

  useEffect(() => {
    setConfirmPaid(booking?.isPaid || false);
    setAddBreakfast(booking?.hasBreakfast || false);
  }, [booking?.isPaid, booking?.hasBreakfast]);

  if (isLoading || isLoadingSettings) return <DetailSkeleton />;
  if (!booking || !settings) return <Empty resource="booking" />;

  const { id: bookingId, guests, totalPrice, numGuests, hasBreakfast, numNights, startDate, endDate, status, cabins } = booking;

  if (status !== "unconfirmed") {
    return (
      <>
        <PageHeader title="Check in" subtitle="This booking is already checked in or checked out." />
        <Button variation="secondary" onClick={moveBack}>&larr; Back</Button>
      </>
    );
  }

  const breakfastCost = settings.breakFastPrice * numGuests * numNights;
  const extra = !hasBreakfast && addBreakfast ? breakfastCost : 0;
  const grandTotal = totalPrice + extra;

  function handleCheckin() {
    if (!confirmPaid) return;
    if (addBreakfast && !hasBreakfast) {
      updateCheckin({
        bookingId,
        breakfast: { hasBreakfast: true, extrasPrice: breakfastCost, totalPrice: totalPrice + breakfastCost },
      });
    } else {
      updateCheckin({ bookingId, breakfast: {} });
    }
  }

  const canNext = step === 2 ? confirmPaid : true;

  return (
    <>
      <PageHeader title="Check in" subtitle={`${guests?.fullName} · Cabin ${cabins?.name}`}>
        <ButtonText onClick={moveBack}>&larr; Cancel</ButtonText>
      </PageHeader>

      <Stepper steps={STEPS} current={step} />

      <Layout>
        <Main>
          {step === 0 && (
            <Card title="Confirm guest details" hint="Already on file — nothing to retype.">
              <Dl>
                <dt>Name</dt>
                <dd>
                  {guests?.countryFlag && <Flag src={guests.countryFlag} alt={guests.nationality || ""} />}
                  {guests?.fullName}
                  {numGuests > 1 && ` + ${numGuests - 1} guests`}
                </dd>
                <dt>Email</dt>
                <dd>{guests?.email}</dd>
                <dt>National ID</dt>
                <dd>{guests?.nationalID || "—"}</dd>
                <dt>Stay</dt>
                <dd>
                  {fmtUTC(startDate)} &rarr; {fmtUTC(endDate)} ({numNights} nights)
                </dd>
              </Dl>
              {startDate && new Date(startDate).getTime() > Date.now() + 36 * 3600000 && (
                <Lead style={{ color: "var(--status-unconfirmed-fg)", fontWeight: 600 }}>
                  Heads up: this stay starts on {fmtUTC(startDate)}, not today. Make sure this is the right booking.
                </Lead>
              )}
              <Lead>Check that the ID matches the guest at the desk, then continue.</Lead>
            </Card>
          )}

          {step === 1 && (
            <Card title="Extras" hint="Optional. You can skip this step.">
              {hasBreakfast ? (
                <Lead>Breakfast is already included in this booking.</Lead>
              ) : (
                <Offer>
                  <b>Add breakfast?</b>
                  <p style={{ margin: "0.6rem 0 1.4rem", fontSize: "var(--text-body)" }}>
                    {formatCurrency(settings.breakFastPrice)} per guest per night · {numGuests} guest(s) × {numNights} nights ={" "}
                    <strong>{formatCurrency(breakfastCost)}</strong>
                  </p>
                  <Checkbox
                    id="breakfast"
                    checked={addBreakfast}
                    onChange={() => {
                      const next = !addBreakfast;
                      setAddBreakfast(next);
                      // total berubah -> konfirmasi ulang, kecuali kembali ke total semula yang sudah lunas
                      setConfirmPaid(Boolean(booking.isPaid) && !next);
                    }}>
                    Yes, add breakfast
                  </Checkbox>
                </Offer>
              )}
            </Card>
          )}

          {step === 2 && (
            <Card title="Payment" hint="The total is shown before you confirm.">
              <Dl>
                <dt>Cabin</dt>
                <dd>{formatCurrency(booking.cabinPrice)}</dd>
                {(hasBreakfast || extra > 0) && (
                  <>
                    <dt>Breakfast</dt>
                    <dd>{formatCurrency(booking.extrasPrice + extra)}</dd>
                  </>
                )}
                <dt style={{ fontWeight: 600, color: "var(--color-grey-800)" }}>Total</dt>
                <dd style={{ fontSize: "var(--text-kpi)", fontWeight: 600 }}>{formatCurrency(grandTotal)}</dd>
              </Dl>
              <Checkbox
                id="paid"
                checked={confirmPaid}
                onChange={() => setConfirmPaid((v) => !v)}
                disabled={booking.isPaid && extra === 0}>
                I confirm that {guests?.fullName} has paid {formatCurrency(grandTotal)}.
              </Checkbox>
            </Card>
          )}

          {step === 3 && (
            <Card title="Ready to check in">
              <Dl>
                <dt>Guest</dt>
                <dd>{guests?.fullName}</dd>
                <dt>Cabin</dt>
                <dd>{cabins?.name}</dd>
                <dt>Departure</dt>
                <dd>{fmtUTC(endDate, { weekday: "long", month: "long", day: "numeric" })}</dd>
                <dt>Breakfast</dt>
                <dd>{hasBreakfast || extra > 0 ? "Included" : "No"}</dd>
                <dt>Paid</dt>
                <dd>{formatCurrency(grandTotal)}</dd>
              </Dl>
            </Card>
          )}

          <Footer>
            <Button variation="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              &larr; Previous
            </Button>
            <Right>
              {step === 1 && !hasBreakfast && (
                <Button
                  variation="secondary"
                  onClick={() => {
                    setAddBreakfast(false);
                    setConfirmPaid(Boolean(booking.isPaid));
                    setStep(2);
                  }}>
                  Skip extras
                </Button>
              )}
              {step < 3 ? (
                <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              ) : (
                <Button variation="accent" size="large" disabled={!confirmPaid || isCheckin} onClick={handleCheckin}>
                  Check in
                </Button>
              )}
            </Right>
          </Footer>
        </Main>

        <BookingSummary booking={booking} extraBreakfast={extra} />
      </Layout>
    </>
  );
}

export default CheckinBooking;
