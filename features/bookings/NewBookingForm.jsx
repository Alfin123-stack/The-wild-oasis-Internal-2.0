"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled from "styled-components";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import Checkbox from "../../ui/Checkbox";
import Stepper from "../../ui/Stepper";
import FormRow from "../../ui/FormRow";
import Form from "../../ui/Form";
import SpinnerMini from "../../ui/SpinnerMini";
import useSettings from "../settings/useSettings";
import { createBooking, getAvailableCabins, getGuests } from "../../services/apiExtra";
import { useUnsavedWarning } from "../../hooks/useUnsavedWarning";
import { addDaysKey, diffDays, keyToDate, todayKey } from "../../utils/dates";
import { formatCurrency } from "../../utils/helpers";
import { media } from "../../styles/breakpoints";

const STEPS = ["Guest", "Dates & cabin", "Details"];

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Tabs = styled.div`
  display: inline-flex;
  justify-self: start;
  width: fit-content;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-buttons);
  overflow: hidden;
  & button {
    border: none;
    min-height: var(--control-h);
    padding: 0 1.4rem;
    background: var(--color-grey-0);
    color: var(--color-grey-600);
    font-weight: 500;
    font-size: 1.3rem;
  }
  & button[aria-pressed="true"] {
    background: var(--color-bronze-tint);
    color: var(--color-grey-900);
    font-weight: 600;
  }
`;

const Pick = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1rem;
  & button {
    width: 100%;
    text-align: left;
    padding: 1rem 1.2rem;
    min-height: var(--control-h);
    border: 1px solid var(--color-grey-200);
    border-radius: var(--radius-inputs);
    background: var(--color-grey-0);
    color: var(--color-grey-800);
  }
  & button[aria-pressed="true"] {
    border-color: var(--color-bronze);
    background: var(--color-bronze-tint);
  }
  & small { display: block; color: var(--color-grey-500); font-size: var(--text-caption); }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
  ${media.down.medium} { grid-template-columns: minmax(0, 1fr); }
  & label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 1.3rem; color: var(--color-grey-600); }
`;

const Summary = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem 2rem;
  padding: 1.6rem;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-inputs);
  font-size: var(--text-body);
  & dt { color: var(--color-grey-500); }
  & dd { text-align: right; font-variant-numeric: tabular-nums; }
  & dt:last-of-type, & dd:last-of-type { font-weight: 700; color: var(--color-grey-800); border-top: 1px solid var(--color-grey-200); padding-top: 0.8rem; }
`;

const Err = styled.p`
  color: var(--status-alert-fg);
  font-size: var(--text-caption);
  margin-top: 0.6rem;
`;

const Native = styled.select`
  width: 100%;
  min-height: var(--control-h);
  padding: 0 1.2rem;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-inputs);
  background: var(--color-grey-0);
  color: var(--color-grey-800);
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
  ${media.down.medium} { flex-direction: column-reverse; & > button { width: 100%; } }
`;

function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function NewBookingForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const today = todayKey();

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("existing");
  const [search, setSearch] = useState("");
  const [guest, setGuest] = useState(null);
  const [newGuest, setNewGuest] = useState({ fullName: "", email: "", nationality: "", phone: "" });
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDaysKey(today, 3));
  const [numGuests, setNumGuests] = useState(2);
  const [cabinId, setCabinId] = useState("");
  const [hasBreakfast, setBreakfast] = useState(false);
  const [isPaid, setPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  useUnsavedWarning(touched);

  const q = useDebounced(search.trim());
  const guestsQuery = useQuery({
    queryKey: ["guests", "pick", q],
    queryFn: () => getGuests(q),
    enabled: mode === "existing" && q.length >= 2,
  });

  const nights = start && end ? diffDays(keyToDate(end), keyToDate(start)) : 0;
  const datesOk = nights >= 1;
  const cabinsQuery = useQuery({
    queryKey: ["cabins", "available", start, end, numGuests],
    queryFn: () => getAvailableCabins({ start, end, guests: numGuests }),
    enabled: datesOk && step >= 1,
  });
  const cabins = cabinsQuery.data || [];
  const cabin = cabins.find((c) => c.id === cabinId);

  // Pilihan cabin dibuang bila tidak lagi tersedia untuk tanggal baru.
  useEffect(() => {
    if (cabinId && cabinsQuery.data && !cabinsQuery.data.some((c) => c.id === cabinId)) setCabinId("");
  }, [cabinsQuery.data, cabinId]);

  const price = useMemo(() => {
    if (!cabin || !settings || !datesOk) return null;
    const cabinPrice = nights * (cabin.regularPrice - cabin.discount);
    const extras = hasBreakfast ? settings.breakFastPrice * nights * numGuests : 0;
    return { cabinPrice, extras, total: cabinPrice + extras };
  }, [cabin, settings, nights, hasBreakfast, numGuests, datesOk]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createBooking({
        cabin: cabinId,
        ...(mode === "existing" ? { guest: guest.id } : { newGuest }),
        startDate: start,
        endDate: end,
        numGuests: Number(numGuests),
        hasBreakfast,
        isPaid,
        observations: notes,
      }),
    onSuccess: (b) => {
      toast.success("Booking created");
      queryClient.invalidateQueries();
      setTouched(false);
      router.push(`/bookings/${b.id}`);
    },
    onError: (err) => setError(err.message),
  });

  function validate(s) {
    if (s === 0) {
      if (mode === "existing" && !guest) return "Pick a guest, or switch to a new guest.";
      if (mode === "new") {
        if (!newGuest.fullName.trim()) return "Enter the guest's full name.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newGuest.email)) return "Enter a valid email address.";
      }
    }
    if (s === 1) {
      if (!datesOk) return "Check-out must be after check-in.";
      if (settings && nights < settings.minBookingLength) return `Minimum stay is ${settings.minBookingLength} nights.`;
      if (settings && nights > settings.maxBookingLength) return `Maximum stay is ${settings.maxBookingLength} nights.`;
      if (settings && numGuests > settings.maxGuestsPerBooking) return `Maximum ${settings.maxGuestsPerBooking} guests per booking.`;
      if (!cabinId) return "Choose an available cabin.";
    }
    return "";
  }

  function next() {
    const msg = validate(step);
    setError(msg);
    if (!msg) setStep(step + 1);
  }

  const touch = (fn) => (e) => {
    setTouched(true);
    setError("");
    fn(e);
  };

  return (
    <Stack>
      <Stepper steps={STEPS} current={step} />
      <Form type="reguler" onSubmit={(e) => { e.preventDefault(); if (step < 2) return next(); const m = validate(1) || validate(0); if (m) return setError(m); mutate(); }}>
        {step === 0 && (
          <>
            <FormRow label="Guest" plain>
              <Tabs role="group" aria-label="Guest type">
                <button type="button" aria-pressed={mode === "existing"} onClick={() => { setMode("existing"); setError(""); }}>Existing guest</button>
                <button type="button" aria-pressed={mode === "new"} onClick={() => { setMode("new"); setError(""); }}>New guest</button>
              </Tabs>
            </FormRow>
            {mode === "existing" ? (
              <FormRow label="Find guest" plain>
                <div>
                  <Input
                    id="guest-search"
                    placeholder="Type a name or email"
                    value={search}
                    autoComplete="off"
                    onChange={touch((e) => setSearch(e.target.value))}
                  />
                  {guest && (
                    <p style={{ marginTop: "1rem", fontSize: "var(--text-body)" }}>
                      Selected: <b>{guest.fullName}</b> <span style={{ color: "var(--color-grey-500)" }}>({guest.email})</span>
                    </p>
                  )}
                  {q.length >= 2 && guestsQuery.data && (
                    <Pick>
                      {guestsQuery.data.length === 0 && <li style={{ color: "var(--color-grey-500)" }}>No guest found. Use &ldquo;New guest&rdquo;.</li>}
                      {guestsQuery.data.slice(0, 6).map((g) => (
                        <li key={g.id}>
                          <button type="button" aria-pressed={guest?.id === g.id} onClick={() => { setGuest(g); setError(""); setTouched(true); }}>
                            {g.fullName}
                            <small>{g.email} · {g.bookingCount} bookings</small>
                          </button>
                        </li>
                      ))}
                    </Pick>
                  )}
                </div>
              </FormRow>
            ) : (
              <>
                <FormRow label="Full name"><Input id="ng-name" placeholder="e.g. Maria Gonzalez" maxLength={80} value={newGuest.fullName} onChange={touch((e) => setNewGuest({ ...newGuest, fullName: e.target.value }))} /></FormRow>
                <FormRow label="Email"><Input id="ng-email" type="email" placeholder="name@example.com" value={newGuest.email} onChange={touch((e) => setNewGuest({ ...newGuest, email: e.target.value }))} /></FormRow>
                <FormRow label="Nationality"><Input id="ng-nat" placeholder="e.g. Indonesia" maxLength={60} value={newGuest.nationality} onChange={touch((e) => setNewGuest({ ...newGuest, nationality: e.target.value }))} /></FormRow>
                <FormRow label="Phone"><Input id="ng-phone" type="tel" placeholder="e.g. +62 812 3456 7890" maxLength={40} value={newGuest.phone} onChange={touch((e) => setNewGuest({ ...newGuest, phone: e.target.value }))} /></FormRow>
              </>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <FormRow label="Dates">
              <Grid>
                <label>Check-in<Input id="start" type="date" min={today} value={start} onChange={touch((e) => { setStart(e.target.value); if (e.target.value >= end) setEnd(addDaysKey(e.target.value, settings?.minBookingLength || 1)); })} /></label>
                <label>Check-out<Input id="end" type="date" min={addDaysKey(start || today, 1)} value={end} onChange={touch((e) => setEnd(e.target.value))} /></label>
              </Grid>
              {datesOk && <p style={{ marginTop: "0.8rem", color: "var(--color-grey-500)" }}>{nights} nights</p>}
            </FormRow>
            <FormRow label="Guests">
              <Input id="guests" type="number" min={1} max={settings?.maxGuestsPerBooking || 20} value={numGuests} onChange={touch((e) => setNumGuests(Number(e.target.value) || 1))} />
            </FormRow>
            <FormRow label="Available cabin">
              <div>
                <Native id="cabin" value={cabinId} onChange={touch((e) => setCabinId(e.target.value))} disabled={!datesOk || cabinsQuery.isFetching}>
                  <option value="">{cabinsQuery.isFetching ? "Checking availability…" : cabins.length ? "Choose a cabin" : "No cabin is free for these dates"}</option>
                  {cabins.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} · up to {c.maxCapacity} · {formatCurrency(c.regularPrice - c.discount)}/night</option>
                  ))}
                </Native>
              </div>
            </FormRow>
          </>
        )}

        {step === 2 && (
          <>
            <FormRow label="Extras">
              <Checkbox id="breakfast" checked={hasBreakfast} onChange={() => { setBreakfast(!hasBreakfast); setTouched(true); }}>
                Include breakfast{settings ? ` (${formatCurrency(settings.breakFastPrice)} per guest per night)` : ""}
              </Checkbox>
            </FormRow>
            <FormRow label="Payment">
              <Checkbox id="paid" checked={isPaid} onChange={() => { setPaid(!isPaid); setTouched(true); }}>
                Guest has already paid
              </Checkbox>
            </FormRow>
            <FormRow label="Notes"><Textarea id="notes" rows={4} maxLength={1000} placeholder="e.g. Late arrival around 10 pm, needs an extra pillow" value={notes} onChange={touch((e) => setNotes(e.target.value))} /></FormRow>
            <FormRow label="Summary">
              <Summary>
                <dt>Guest</dt><dd>{mode === "existing" ? guest?.fullName : newGuest.fullName}</dd>
                <dt>Stay</dt><dd>{start} to {end} ({nights} nights)</dd>
                <dt>Cabin</dt><dd>{cabin?.name}</dd>
                <dt>Cabin price</dt><dd>{price ? formatCurrency(price.cabinPrice) : "—"}</dd>
                <dt>Breakfast</dt><dd>{price ? formatCurrency(price.extras) : "—"}</dd>
                <dt>Total</dt><dd>{price ? formatCurrency(price.total) : "—"}</dd>
              </Summary>
            </FormRow>
          </>
        )}

        {error && <Err role="alert">{error}</Err>}

        <Actions style={{ marginTop: "2rem" }}>
          <Button type="button" variation="secondary" onClick={() => (step === 0 ? router.push("/bookings") : (setError(""), setStep(step - 1)))} disabled={isPending}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          <Button variation="accent" disabled={isPending}>
            {isPending ? <SpinnerMini /> : step < 2 ? "Next" : "Create booking"}
          </Button>
        </Actions>
      </Form>
    </Stack>
  );
}

export default NewBookingForm;
