"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import { HiCheck } from "react-icons/hi2";

const Wrap = styled.ol`
  display: flex;
  gap: 0;
  counter-reset: step;
`;

const Item = styled.li`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.3rem;
  font-weight: 500;
  color: ${(p) => (p.$state === "todo" ? "var(--color-grey-500)" : "var(--color-grey-800)")};

  &:not(:last-child)::after {
    content: "";
    flex: 1;
    height: 1px;
    margin: 0 1.2rem;
    background-color: ${(p) => (p.$state === "done" ? "var(--color-bronze)" : "var(--color-grey-300)")};
  }

  & span.label { white-space: nowrap; }

  /* < 600px: hanya langkah aktif yang menampilkan label */
  @media (max-width: 599.98px) {
    & span.label { display: none; }
    &[data-current="true"] { flex: 0 0 auto; }
    &[data-current="true"] span.label { display: inline; }
    &:not(:last-child)::after { margin: 0 0.8rem; min-width: 0.8rem; }
  }
`;

const Dot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  font-size: 1.2rem;
  font-weight: 600;
  border: 1px solid ${(p) => (p.$state === "todo" ? "var(--color-grey-300)" : "var(--color-bronze)")};
  background-color: ${(p) =>
    p.$state === "done" ? "var(--color-bronze)" : p.$state === "current" ? "var(--color-bronze-tint)" : "transparent"};
  color: ${(p) =>
    p.$state === "done" ? "#fffdf9" : p.$state === "current" ? "var(--color-bronze-strong)" : "var(--color-grey-400)"};

  & svg { width: 1.4rem; height: 1.4rem; }
`;

// steps: string[]; current: index (0-based)
function Stepper({ steps, current }) {
  return (
    <Wrap aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <Item key={label} $state={state} data-current={i === current}>
            <Dot $state={state}>{state === "done" ? <HiCheck /> : i + 1}</Dot>
            <span className="label">{label}</span>
          </Item>
        );
      })}
    </Wrap>
  );
}

export default Stepper;
