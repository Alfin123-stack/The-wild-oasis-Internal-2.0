"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import Heading from "./Heading";

const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.6rem 2.4rem;
  flex-wrap: wrap;
`;

const Sub = styled.p`
  margin-top: 0.8rem;
  color: var(--color-grey-500);
  font-size: var(--text-body);
  max-width: 64rem;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
`;

function PageHeader({ title, subtitle, children }) {
  return (
    <Wrap>
      <div>
        <Heading as="h1">{title}</Heading>
        {subtitle && <Sub>{subtitle}</Sub>}
      </div>
      {children && <Actions>{children}</Actions>}
    </Wrap>
  );
}

export default PageHeader;
