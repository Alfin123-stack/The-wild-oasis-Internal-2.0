"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";

import Button from "../../ui/Button";
import Card from "../../ui/Card";
import Tabs from "../../ui/Tabs";
import Input from "../../ui/Input";
import { FormSkeleton } from "../../ui/Skeleton";
import useSettings from "./useSettings";
import useUpdateSetting from "./useUpdateSetting";
import { useUnsavedWarning } from "../../hooks/useUnsavedWarning";
import { media } from "../../styles/breakpoints";

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(18rem, 22rem) minmax(0, 1fr);
  gap: clamp(1.6rem, 1rem + 1.6vw, 3.2rem);
  align-items: start;

  ${media.down.expanded} { grid-template-columns: minmax(0, 1fr); }
`;

const Field = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18rem;
  gap: 0.4rem 2.4rem;
  align-items: center;
  padding: 1.8rem 0;

  &:not(:last-of-type) { border-bottom: 1px solid var(--color-grey-200); }

  & label { font-weight: 600; font-size: var(--text-body); }
  & p { grid-column: 1; font-size: 1.3rem; color: var(--color-grey-500); }
  & input { grid-column: 2; grid-row: 1 / span 2; }
  & small { grid-column: 1 / -1; color: var(--status-alert-fg); font-size: 1.3rem; }

  /* HP: label + keterangan di atas, input penuh lebar di bawah (harus setelah aturan input di atas) */
  ${media.down.medium} {
    grid-template-columns: minmax(0, 1fr);
    & input { grid-column: 1; grid-row: auto; }
  }
`;

const Bar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.2rem;
  margin-top: 0.8rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-grey-200);
  flex-wrap: wrap;

  & span { margin-right: auto; font-size: 1.3rem; color: var(--color-grey-500); }

  ${media.down.medium} {
    flex-direction: column-reverse;
    align-items: stretch;
    & span { margin-right: 0; text-align: center; }
    & button { width: 100%; }
  }
`;

function UpdateSettingsForm() {
  const [tab, setTab] = useState("stay");
  const { isLoading, settings } = useSettings();
  const { updateSetting, isEditing } = useUpdateSetting();
  const { register, handleSubmit, reset, getValues, formState } = useForm({ defaultValues: {} });
  const { errors, isDirty } = formState;

  // isi form saat data tiba / berubah setelah disimpan
  useEffect(() => {
    if (!settings) return;
    reset({
      minBookingLength: settings.minBookingLength,
      maxBookingLength: settings.maxBookingLength,
      maxGuestsPerBooking: settings.maxGuestsPerBooking,
      breakFastPrice: settings.breakFastPrice,
      lowOccupancyPct: settings.lowOccupancyPct ?? 40,
      unpaidWithinDays: settings.unpaidWithinDays ?? 2,
      idleCabinDays: settings.idleCabinDays ?? 30,
    });
  }, [settings, reset]);

  useUnsavedWarning(isDirty);

  if (isLoading) return <FormSkeleton fields={4} />;

  function onSubmit(values) {
    updateSetting({
      minBookingLength: Number(values.minBookingLength),
      maxBookingLength: Number(values.maxBookingLength),
      maxGuestsPerBooking: Number(values.maxGuestsPerBooking),
      breakFastPrice: Number(values.breakFastPrice),
      lowOccupancyPct: Number(values.lowOccupancyPct),
      unpaidWithinDays: Number(values.unpaidWithinDays),
      idleCabinDays: Number(values.idleCabinDays),
    });
  }

  const num = (label, min = 1) => ({
    required: `${label} is required`,
    min: { value: min, message: `Must be at least ${min}` },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Layout>
        <Tabs
          vertical
          label="Settings sections"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "stay", label: "Stay rules" },
            { value: "pricing", label: "Pricing" },
            { value: "insights", label: "Dashboard alerts" },
          ]}
        />

        <Card title={tab === "stay" ? "Stay rules" : tab === "pricing" ? "Pricing" : "Dashboard alerts"} hint={tab === "insights" ? "When the dashboard cards should raise a flag." : "Applies to every new booking."}>
          <div hidden={tab !== "stay"}>
            <Field>
              <label htmlFor="min-nights">Minimum nights per booking</label>
              <p>Shortest stay a guest can book.</p>
              <Input id="min-nights" type="number" disabled={isEditing} {...register("minBookingLength", num("Minimum"))} />
              {errors.minBookingLength && <small>{errors.minBookingLength.message}</small>}
            </Field>
            <Field>
              <label htmlFor="max-nights">Maximum nights per booking</label>
              <p>Longest stay a guest can book.</p>
              <Input
                id="max-nights"
                type="number"
                disabled={isEditing}
                {...register("maxBookingLength", {
                  ...num("Maximum"),
                  validate: (v) => Number(v) >= Number(getValues("minBookingLength")) || "Must be at least the minimum nights",
                })}
              />
              {errors.maxBookingLength && <small>{errors.maxBookingLength.message}</small>}
            </Field>
            <Field>
              <label htmlFor="max-guests">Maximum guests per booking</label>
              <p>Upper limit for one reservation.</p>
              <Input id="max-guests" type="number" disabled={isEditing} {...register("maxGuestsPerBooking", num("Maximum guests"))} />
              {errors.maxGuestsPerBooking && <small>{errors.maxGuestsPerBooking.message}</small>}
            </Field>
          </div>

          <div hidden={tab !== "pricing"}>
            <Field>
              <label htmlFor="breakfast-price">Breakfast price (USD)</label>
              <p>Per guest, per night.</p>
              <Input id="breakfast-price" type="number" step="0.01" disabled={isEditing} {...register("breakFastPrice", num("Breakfast price", 0))} />
              {errors.breakFastPrice && <small>{errors.breakFastPrice.message}</small>}
            </Field>
          </div>

          <div hidden={tab !== "insights"}>
            <Field>
              <label htmlFor="low-occ">Quiet-day threshold (%)</label>
              <p>A day counts as quiet when occupancy is below this.</p>
              <Input id="low-occ" type="number" disabled={isEditing} {...register("lowOccupancyPct", { required: "Required", min: { value: 0, message: "0 to 100" }, max: { value: 100, message: "0 to 100" } })} />
              {errors.lowOccupancyPct && <small>{errors.lowOccupancyPct.message}</small>}
            </Field>
            <Field>
              <label htmlFor="unpaid-days">Unpaid arrivals: look ahead (days)</label>
              <p>Flag unpaid bookings arriving within this many days.</p>
              <Input id="unpaid-days" type="number" disabled={isEditing} {...register("unpaidWithinDays", { required: "Required", min: { value: 0, message: "0 to 30" }, max: { value: 30, message: "0 to 30" } })} />
              {errors.unpaidWithinDays && <small>{errors.unpaidWithinDays.message}</small>}
            </Field>
            <Field>
              <label htmlFor="idle-days">Idle cabin after (days)</label>
              <p>Flag a cabin with no bookings for this many days.</p>
              <Input id="idle-days" type="number" disabled={isEditing} {...register("idleCabinDays", { required: "Required", min: { value: 1, message: "1 to 365" }, max: { value: 365, message: "1 to 365" } })} />
              {errors.idleCabinDays && <small>{errors.idleCabinDays.message}</small>}
            </Field>
          </div>

          <Bar>
            <span>{isDirty ? "You have unsaved changes." : "All changes saved."}</span>
            <Button type="button" variation="secondary" disabled={!isDirty || isEditing} onClick={() => reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={!isDirty || isEditing}>
              Save changes
            </Button>
          </Bar>
        </Card>
      </Layout>
    </form>
  );
}

export default UpdateSettingsForm;
