"use client";

import styled from "styled-components";

const Input = styled.input`
  border: 1px solid var(--color-input-border);
  background-color: var(--color-grey-0);
  color: var(--color-input-text);
  border-radius: var(--radius-inputs);
  min-height: var(--control-h);
  padding: 0 1.2rem;
  font-size: 1.4rem;
  width: 100%;
  max-width: 100%;

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:hover:not(:disabled) {
    border-color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-bronze);
    box-shadow: 0 0 0 3px var(--color-bronze-tint);
  }
`;

export default Input;
