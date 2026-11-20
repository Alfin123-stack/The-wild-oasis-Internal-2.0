"use client";

import styled from "styled-components";

const DashboardBox = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-subtle);
  padding: var(--card-pad);
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  min-width: 0;
`;

export default DashboardBox;
