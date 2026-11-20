"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";

const StyledFormRow = styled.div.withConfig({ shouldForwardProp: (p) => p !== "$plain" })`
  display: grid;
  align-items: center;
  grid-template-columns: 20rem minmax(0, 1fr);
  column-gap: 2.4rem;
  row-gap: 0.6rem;
  padding: 1.4rem 0;

  &:has(textarea) { align-items: start; }
  &:has(textarea) > label { padding-top: 1rem; }

  &:first-child { padding-top: 0; }
  &:last-child { padding-bottom: 0; }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-200);
  }

  ${(p) => (p.$plain ? "" : `
  &:has(button) {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
  }

`)}

  @media (max-width: 839.98px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.6rem;
    align-items: stretch;
    padding: 1.2rem 0;
  }

  ${(p) =>
    p.$plain ? "" : `&:has(button) { @media (max-width: 599.98px) { flex-direction: column-reverse; } }`}
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 1.3rem;
  color: var(--color-grey-700);
`;

const Error = styled.span`
  grid-column: 2;
  font-size: 1.3rem;
  color: var(--status-alert-fg);
  @media (max-width: 839.98px) { grid-column: 1; }
`;

// plain: baris berisi tombol yang bukan aksi form (mis. tab, daftar pilihan) tidak diratakan ke kanan.
function FormRow({ label, error, children, plain = false }) {
  const first = Array.isArray(children) ? children[0] : children;
  return (
    <StyledFormRow $plain={plain}>
      {label && <Label htmlFor={first?.props?.id}>{label}</Label>}
      {children}
      {error && <Error>{error}</Error>}
    </StyledFormRow>
  );
}

export default FormRow;
