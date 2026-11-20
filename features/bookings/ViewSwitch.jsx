"use client";

/* eslint-disable react/prop-types */
import Link from "next/link";
import styled from "styled-components";
import { HiOutlineTableCells, HiOutlineViewColumns } from "react-icons/hi2";

const Wrap = styled.div`
  display: inline-flex;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-buttons);
  overflow: hidden;
  background-color: var(--color-grey-0);
`;

const Item = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  min-height: var(--control-h);
  padding: 0 1.4rem;
  font-size: 1.3rem;
  font-weight: 500;
  color: ${(p) => (p.$active ? "var(--color-action-text)" : "var(--color-grey-600)")};
  background-color: ${(p) => (p.$active ? "var(--color-action-fill)" : "transparent")};

  &:not(:last-child) { border-right: 1px solid var(--color-grey-200); }
  &:hover { background-color: ${(p) => (p.$active ? "var(--color-action-fill)" : "var(--color-grey-100)")}; }
  & svg { width: 1.6rem; height: 1.6rem; }
`;

function ViewSwitch({ current }) {
  return (
    <Wrap role="group" aria-label="View">
      <Item href="/bookings" $active={current === "table"}>
        <HiOutlineTableCells /> Table
      </Item>
      <Item href="/bookings/timeline" $active={current === "timeline"}>
        <HiOutlineViewColumns /> Timeline
      </Item>
    </Wrap>
  );
}

export default ViewSwitch;
