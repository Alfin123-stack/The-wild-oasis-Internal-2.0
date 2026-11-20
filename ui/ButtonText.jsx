"use client";

import styled from "styled-components";

const ButtonText = styled.button`
  color: var(--color-bronze-strong);
  font-size: 1.3rem;
  min-height: var(--control-h-sm);
  padding: 0 0.4rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: center;
  background: none;
  border: none;
  border-radius: var(--radius-inputs);

  &:hover,
  &:active {
    color: var(--color-bronze-hover);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export default ButtonText;
