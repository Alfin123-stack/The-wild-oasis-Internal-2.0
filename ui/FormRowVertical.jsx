"use client";

import styled from "styled-components";

const StyledFormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem 0;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 1.3rem;
  color: var(--color-grey-700);
`;

const Error = styled.span`
  font-size: 1.3rem;
  color: var(--status-alert-fg);
`;

function FormRowVertical({ label, error, children }) {
  return (
    <StyledFormRow>
      {label && <Label htmlFor={children.props.id}>{label}</Label>}
      {children}
      {error && <Error role="alert">{error}</Error>}
    </StyledFormRow>
  );
}

export default FormRowVertical;
