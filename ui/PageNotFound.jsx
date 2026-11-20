"use client";

import styled from "styled-components";
import { useMoveBack } from "../hooks/useMoveBack";
import Heading from "../ui/Heading";
import Button from "../ui/Button";

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
  border-top: 3px solid var(--color-bronze);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-md);
  padding: clamp(2.4rem, 1.2rem + 3vw, 4.8rem);
  flex: 0 1 60rem;
  text-align: center;

  & .code {
    font-family: var(--font-serif);
    font-size: clamp(6rem, 4rem + 6vw, 9rem);
    line-height: 1;
    color: var(--color-bronze);
    margin-bottom: 1.2rem;
  }

  & h1 { margin-bottom: 1rem; }
  & h1::after { margin-inline: auto; }
  & p { color: var(--color-grey-500); margin-bottom: 3.2rem; font-size: var(--text-body-lg); }
`;

function PageNotFound() {
  const moveBack = useMoveBack();
  return (
    <Main>
      <Box>
        <div className="code">404</div>
        <Heading as="h1">This trail leads nowhere</Heading>
        <p>The page you are looking for could not be found.</p>
        <Button onClick={moveBack} size="large" variation="secondary">
          &larr; Go back
        </Button>
      </Box>
    </Main>
  );
}

export default PageNotFound;
