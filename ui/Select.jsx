"use client";

/* eslint-disable react/prop-types */
import { useQueryParams } from "../hooks/useQueryParams";
import styled from "styled-components";

const StyledSelect = styled.select`
  font-size: 1.3rem;
  min-height: var(--control-h);
  padding: 0 1.2rem;
  max-width: 100%;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-buttons);
  background-color: var(--color-grey-0);
  color: var(--color-grey-800);
  font-weight: 500;

  &:hover {
    border-color: var(--color-grey-400);
  }
`;

function Select({ options, label = "Sort by" }) {
  const { searchParams, setParams } = useQueryParams();
  const filterParams = searchParams.get("sortBy") || options.at(0).value;

  function handleSelect(e) {
    setParams({ sortBy: e.target.value });
  }
  return (
    <StyledSelect aria-label={label} onChange={handleSelect} value={filterParams}>
      {options.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </StyledSelect>
  );
}

export default Select;
