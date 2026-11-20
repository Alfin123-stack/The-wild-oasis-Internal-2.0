"use client";

import styled from "styled-components";

const ButtonIcon = styled.button.attrs({ type: "button" })`
  background: none;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--control-h);
  min-height: var(--control-h);
  padding: 0.5rem;
  border-radius: var(--radius-buttons);

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-600);
  }

  &:hover svg {
    color: var(--color-grey-800);
  }
`;

export default ButtonIcon;
