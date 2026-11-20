"use client";

/* eslint-disable react/prop-types */
import { eachDayOfInterval, isSameDay, subDays } from "date-fns";
import Stat from "./Stat";
import { formatCurrency } from "../../utils/helpers";

const delta = (cur, prev) => (prev > 0 ? (cur - prev) / prev : null);

function Stats({ bookings, previousBookings = [], confirmedStays, previousConfirmed = [], countCabins, numDays }) {
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);

  const numBookings = bookings.length;
  const sales = sum(bookings, (b) => b.totalPrice);
  const numConfirmed = confirmedStays.length;

  const occ = (stays) =>
    countCabins > 0 ? Math.min(1, sum(stays, (s) => s.numNights) / (numDays * countCabins)) : 0;
  const occupancy = occ(confirmedStays);

  const days = eachDayOfInterval({ start: subDays(new Date(), numDays - 1), end: new Date() });
  const perDay = (arr, dateKey, f) =>
    days.map((d) => sum(arr.filter((x) => isSameDay(d, new Date(x[dateKey]))), f));

  return (
    <>
      <Stat
        title="Bookings"
        value={numBookings}
        delta={delta(numBookings, previousBookings.length)}
        spark={perDay(bookings, "created_at", () => 1)}
      />
      <Stat
        title="Sales"
        value={formatCurrency(sales)}
        delta={delta(sales, sum(previousBookings, (b) => b.totalPrice))}
        spark={perDay(bookings, "created_at", (b) => b.totalPrice)}
      />
      <Stat
        title="Check-ins"
        value={numConfirmed}
        delta={delta(numConfirmed, previousConfirmed.length)}
        spark={perDay(confirmedStays, "startDate", () => 1)}
      />
      <Stat
        title="Occupancy"
        value={Math.round(occupancy * 100) + "%"}
        delta={delta(occupancy, occ(previousConfirmed))}
        spark={perDay(confirmedStays, "startDate", (s) => s.numNights)}
      />
    </>
  );
}

export default Stats;
