"use client";

/* eslint-disable react/prop-types */
import { useQueryParams } from "../hooks/useQueryParams";
import styled, { css } from "styled-components";

// Segmented control: satu blok bergaris, item aktif = navy terisi.
const StyledFilter = styled.div`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--radius-buttons);
  display: inline-flex;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const FilterButton = styled.button.attrs({ type: "button" })`
  background-color: transparent;
  color: var(--color-grey-600);
  border: none;
  font-weight: 500;
  font-size: 1.3rem;
  min-height: var(--control-h);
  padding: 0 1.4rem;
  white-space: nowrap;

  &:not(:last-child) {
    border-right: 1px solid var(--color-grey-200);
  }

  &:hover:not(:disabled) {
    background-color: var(--color-grey-100);
    color: var(--color-grey-800);
  }

  ${(props) =>
    props.$active &&
    css`
      background-color: var(--color-action-fill);
      color: var(--color-action-text);

      &:hover:not(:disabled) {
        background-color: var(--color-action-fill);
        color: var(--color-action-text);
      }
    `}
`;

function Filter({ filterField, options }) {
  const { searchParams, setParams } = useQueryParams();
  const filterParams = searchParams.get(filterField) || options.at(0).value;

  function handleClick(value) {
    // kembali ke halaman 1 bila filter berubah
    setParams({
      [filterField]: value,
      ...(searchParams.get("page") ? { page: 1 } : {}),
    });
  }
  return (
    <StyledFilter>
      {options.map((item) => (
        <FilterButton
          onClick={() => handleClick(item.value)}
          key={item.value}
          $active={item.value === filterParams}>
          {item.label}
        </FilterButton>
      ))}
    </StyledFilter>
  );
}

export default Filter;
