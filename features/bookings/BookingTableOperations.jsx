"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiArrowDownTray, HiPlus, HiXMark } from "react-icons/hi2";
import Button from "../../ui/Button";
import styled from "styled-components";
import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import Select from "../../ui/Select";
import ViewSwitch from "./ViewSwitch";
import { useQueryParams } from "../../hooks/useQueryParams";

const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid var(--color-bronze);
  background-color: var(--color-bronze-tint);
  color: var(--color-bronze-strong);
  font-size: 1.2rem;
  font-weight: 600;
  min-height: var(--control-h-sm);
  padding: 0 1rem;
  border-radius: var(--radius-buttons);
  & svg { width: 1.4rem; height: 1.4rem; }
`;

function BookingTableOperations() {
  const { searchParams, setParams } = useQueryParams();
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");
  const router = useRouter();

  // Filter terakhir diingat per browser: dipulihkan hanya bila halaman dibuka tanpa filter apa pun.
  useEffect(() => {
    try {
      if (!status && !sortBy && !q) {
        const saved = JSON.parse(localStorage.getItem("bookingFilters") || "null");
        if (saved && (saved.status || saved.sortBy)) setParams({ status: saved.status, sortBy: saved.sortBy });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      if (status || sortBy) localStorage.setItem("bookingFilters", JSON.stringify({ status, sortBy }));
    } catch {}
  }, [status, sortBy]);

  const exportHref = `/api/export/bookings?${new URLSearchParams({ ...(status && status !== "all" ? { status } : {}), ...(q ? { q } : {}) })}`;

  return (
    <TableOperations style={{ flexWrap: "wrap" }}>
      {q && (
        <Chip onClick={() => setParams({ q: null, page: null })} title="Clear search">
          &ldquo;{q}&rdquo; <HiXMark />
        </Chip>
      )}
      <Filter
        filterField="status"
        options={[
          { value: "all", label: "All" },
          { value: "unconfirmed", label: "Unconfirmed" },
          { value: "checked-in", label: "In-house" },
          { value: "checked-out", label: "Checked out" },
          { value: "cancelled", label: "Cancelled" },
        ]}
      />
      <Select
        options={[
          { value: "startDate-desc", label: "Date (latest first)" },
          { value: "startDate-asc", label: "Date (earliest first)" },
          { value: "totalPrice-desc", label: "Amount (high first)" },
          { value: "totalPrice-asc", label: "Amount (low first)" },
        ]}
      />
      <ViewSwitch current="table" />
      <Button as="a" href={exportHref} download variation="secondary" size="small" title="Download the bookings in this view as CSV">
        <HiArrowDownTray /> Export CSV
      </Button>
      <Button variation="accent" size="small" onClick={() => router.push("/bookings/new")}>
        <HiPlus /> New booking
      </Button>
    </TableOperations>
  );
}

export default BookingTableOperations;
