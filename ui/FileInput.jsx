"use client";

import styled from "styled-components";

const FileInput = styled.input.attrs({ type: "file" })`
  font-size: 1.3rem;
  border-radius: var(--radius-inputs);

  &::file-selector-button {
    font: inherit;
    font-weight: 500;
    min-height: var(--control-h);
    padding: 0 1.6rem;
    margin-right: 1.2rem;
    border-radius: var(--radius-buttons);
    border: 1px solid var(--color-grey-300);
    color: var(--color-grey-800);
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-grey-100);
    }
  }
`;

export default FileInput;
