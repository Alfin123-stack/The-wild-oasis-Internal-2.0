"use client";

import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  to { transform: rotate(1turn); }
`;

const Spinner = styled.div`
  margin: 4.8rem auto;
  width: 4rem;
  aspect-ratio: 1;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-grey-200);
  border-top-color: var(--color-bronze);
  animation: ${rotate} 0.8s infinite linear;
`;

export default Spinner;
