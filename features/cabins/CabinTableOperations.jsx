"use client";

import styled from "styled-components";
import { HiOutlineSquares2X2, HiOutlineTableCells } from "react-icons/hi2";
import TableOperations from "../../ui/TableOperations";
import Filter from "../../ui/Filter";
import Select from "../../ui/Select";
import { useQueryParams } from "../../hooks/useQueryParams";
import useUser from "../authentication/useUser";

const Toggle = styled.div`
  display: inline-flex;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-buttons);
  overflow: hidden;
  background-color: var(--color-grey-0);

  & button {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    min-height: var(--control-h);
    padding: 0 1.4rem;
    font-size: 1.3rem;
    font-weight: 500;
    background: none;
    border: none;
    color: var(--color-grey-600);
  }
  & button + button { border-left: 1px solid var(--color-grey-200); }
  & button[aria-pressed="true"] { background-color: var(--color-action-fill); color: var(--color-action-text); }
  & svg { width: 1.6rem; height: 1.6rem; }
`;

function CabinTableOperations() {
  const { searchParams, setParams } = useQueryParams();
  const view = searchParams.get("view") === "table" ? "table" : "grid";
  const { isAdmin } = useUser();
  const showArchived = searchParams.get("archived") === "1";
  return (
    <TableOperations style={{ flexWrap: "wrap" }}>
      <Filter
        filterField="discount"
        options={[
          { value: "all", label: "All" },
          { value: "no-discount", label: "No discount" },
          { value: "with-discount", label: "With discount" },
        ]}
      />
      <Select
        options={[
          { value: "name-asc", label: "Name (A-Z)" },
          { value: "name-desc", label: "Name (Z-A)" },
          { value: "maxCapacity-asc", label: "Capacity (low to high)" },
          { value: "maxCapacity-desc", label: "Capacity (high to low)" },
          { value: "regularPrice-asc", label: "Price (low to high)" },
          { value: "regularPrice-desc", label: "Price (high to low)" },
        ]}
      />
      {isAdmin && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", fontSize: "1.3rem", minHeight: "var(--control-h)" }}>
          <input type="checkbox" checked={showArchived} onChange={(e) => setParams({ archived: e.target.checked ? "1" : null, page: null })} />
          Show archived
        </label>
      )}
      <Toggle role="group" aria-label="View">
        <button type="button" aria-pressed={view === "grid"} onClick={() => setParams({ view: "grid", page: null })}>
          <HiOutlineSquares2X2 /> Cards
        </button>
        <button type="button" aria-pressed={view === "table"} onClick={() => setParams({ view: "table", page: null })}>
          <HiOutlineTableCells /> Table
        </button>
      </Toggle>
    </TableOperations>
  );
}

export default CabinTableOperations;
