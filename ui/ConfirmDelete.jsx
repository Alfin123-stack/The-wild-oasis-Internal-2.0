"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import Button from "./Button";
import Heading from "./Heading";
import { media } from "../styles/breakpoints";

const StyledConfirmDelete = styled.div`
  width: 42rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  & p {
    color: var(--color-grey-500);
    font-size: var(--text-body);
    margin-bottom: 1.2rem;
  }

  & div {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;

    ${media.down.medium} { flex-direction: column-reverse; & > button { width: 100%; } }
  }
`;

function ConfirmDelete({ resourceName, onConfirm, disabled, onClose, verb = "Delete", message, cancelLabel = "Cancel" }) {
  return (
    <StyledConfirmDelete>
      <Heading as="h2">{verb} {resourceName}</Heading>
      <p>
        {message ||
          `Are you sure you want to delete this ${resourceName} permanently? This action cannot be undone.`}
      </p>
      <div>
        <Button onClick={onClose} variation="secondary" disabled={disabled}>
          {cancelLabel}
        </Button>
        <Button onClick={() => { onConfirm(); onClose?.(); }} variation="danger" disabled={disabled}>
          {verb}
        </Button>
      </div>
    </StyledConfirmDelete>
  );
}

export default ConfirmDelete;
