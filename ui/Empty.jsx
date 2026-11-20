"use client";

import styled from "styled-components";

const Box = styled.div`
  text-align: center;
  padding: 4.8rem 2.4rem;
  border: 1px dashed var(--color-grey-300);
  border-radius: var(--radius-cards);
  color: var(--color-grey-500);

  & h3 {
    font-family: var(--font-serif);
    font-size: var(--text-heading);
    color: var(--color-grey-700);
    margin-bottom: 0.4rem;
  }
`;

function Empty({ resource }) {
  return (
    <Box>
      <h3>Nothing here</h3>
      <p>No {resource} could be found.</p>
    </Box>
  );
}

export default Empty;
