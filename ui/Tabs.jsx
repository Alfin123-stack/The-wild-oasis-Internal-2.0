"use client";

/* eslint-disable react/prop-types */
import styled, { css } from "styled-components";

const List = styled.div`
  display: flex;
  gap: 0.4rem;
  ${(p) =>
    p.$vertical
      ? css`
          flex-direction: column;
        `
      : css`
          border-bottom: 1px solid var(--color-grey-200);
          gap: 1.6rem;
          overflow-x: auto;
          scrollbar-width: none;
          &::-webkit-scrollbar { display: none; }
        `}
`;

const Tab = styled.button.attrs({ type: "button" })`
  background: none;
  border: none;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-grey-500);
  text-align: left;
  white-space: nowrap;

  ${(p) =>
    p.$vertical
      ? css`
          min-height: var(--control-h);
          padding: 0.6rem 1.4rem;
          border-left: 2px solid transparent;
          border-radius: 0;

          &:hover { background-color: var(--color-grey-100); color: var(--color-grey-800); }

          ${p.$active && css`
            color: var(--color-grey-800);
            font-weight: 600;
            border-left-color: var(--color-bronze);
            background-color: var(--color-bronze-tint);
          `}
        `
      : css`
          min-height: var(--control-h);
          min-width: var(--control-h);
          padding: 0.6rem 0.4rem;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;

          &:hover { color: var(--color-grey-800); }

          ${p.$active && css`
            color: var(--color-grey-800);
            font-weight: 600;
            border-bottom-color: var(--color-bronze);
          `}
        `}
`;

// tabs: [{ value, label }]
function Tabs({ tabs, value, onChange, vertical = false, label }) {
  return (
    <List $vertical={vertical} role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <Tab
          key={t.value}
          role="tab"
          aria-selected={t.value === value}
          $vertical={vertical}
          $active={t.value === value}
          onClick={() => onChange(t.value)}>
          {t.label}
        </Tab>
      ))}
    </List>
  );
}

export default Tabs;
