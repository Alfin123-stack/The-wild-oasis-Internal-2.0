"use client";

import styled from "styled-components";

const Textarea = styled.textarea`
  padding: 0.9rem 1.2rem;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-inputs);
  background-color: var(--color-grey-0);
  color: var(--color-input-text);
  font-size: 1.4rem;
  width: 100%;
  min-height: 14rem;
  line-height: 1.5;
  font-family: inherit;
  resize: vertical;

  &::placeholder { color: var(--color-grey-400); }

  &:focus {
    outline: none;
    border-color: var(--color-bronze);
    box-shadow: 0 0 0 3px var(--color-bronze-tint);
  }
`;

export default Textarea;
