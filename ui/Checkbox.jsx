"use client";

import styled from "styled-components";

const StyledCheckbox = styled.div`
  display: flex;
  gap: 1.2rem;
  font-size: 1.4rem;
  align-items: center;
  min-height: var(--control-h-sm);

  & input[type="checkbox"] {
    height: 2rem;
    width: 2rem;
    flex-shrink: 0;
    outline-offset: 2px;
    transform-origin: 0;
    accent-color: var(--color-accent-fill);
  }

  & input[type="checkbox"]:disabled {
    accent-color: var(--color-accent-fill);
  }

  & label {
    flex: 1;
    min-height: var(--control-h-sm);
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
`;

function Checkbox({ checked, onChange, disabled = false, id, children }) {
  return (
    <StyledCheckbox>
      <input type="checkbox" id={id} checked={checked} onChange={onChange} disabled={disabled} />
      <label htmlFor={!disabled ? id : ""}>{children}</label>
    </StyledCheckbox>
  );
}

export default Checkbox;
