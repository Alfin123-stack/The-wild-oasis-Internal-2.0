"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import Heading from "./Heading";
import Button from "./Button";

const Main = styled.main`
  min-height: 100vh;
  background-color: var(--color-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.6rem, 1rem + 3vw, 4.8rem);
`;

const Box = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-top: 3px solid var(--status-alert-fg);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-md);
  padding: clamp(2.4rem, 1.2rem + 3vw, 4.8rem);
  flex: 0 1 64rem;
  text-align: center;

  & h1 { margin-bottom: 1.6rem; }
  & h1::after { margin-inline: auto; }
  & p {
    font-family: var(--font-mono);
    font-size: 1.3rem;
    margin-bottom: 3.2rem;
    color: var(--color-grey-500);
  }
`;

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Main>
      <Box>
        <Heading as="h1">Something went wrong</Heading>
        <p>
          Please try again. If it keeps happening, tell your admin what you were doing.
        </p>
        {process.env.NODE_ENV !== "production" && error?.message && <p style={{ fontSize: "1.2rem" }}>{error.message}</p>}
        <Button onClick={resetErrorBoundary} size="large" variation="primary">
          Try again
        </Button>
      </Box>
    </Main>
  );
}

export default ErrorFallback;
