"use client";

import styled from 'styled-components';

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 599.98px) {
    flex-direction: column-reverse;
    & > * { width: 100%; }
  }
`;

export default ButtonGroup;
