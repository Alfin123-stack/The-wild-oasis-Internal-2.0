"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";

const StyledCard = styled.section`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-subtle);
  padding: ${(p) => (p.$flush ? "0" : "var(--card-pad)")};
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  min-width: 0;
`;

const Head = styled.header`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.6rem;
  padding: ${(p) => (p.$flush ? "var(--card-pad) var(--card-pad) 0" : "0")};

  & h2 {
    font-family: var(--font-serif);
    font-size: var(--text-title);
    font-weight: 700;
    color: var(--color-grey-800);
  }

  & small {
    font-size: var(--text-caption);
    color: var(--color-grey-500);
  }
`;

// <Card title="..." hint="..." action={<Button/>} flush>
function Card({ title, hint, action, flush = false, children, ...rest }) {
  return (
    <StyledCard $flush={flush} {...rest}>
      {(title || action) && (
        <Head $flush={flush}>
          <div>
            {title && <h2>{title}</h2>}
            {hint && <small>{hint}</small>}
          </div>
          {action}
        </Head>
      )}
      {children}
    </StyledCard>
  );
}

export default Card;
