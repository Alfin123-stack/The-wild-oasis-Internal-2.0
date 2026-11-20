"use client";

import styled, { css } from "styled-components";

const Form = styled.form`
  ${(props) =>
    props.type === "reguler" &&
    css`
      padding: clamp(1.6rem, 1rem + 2vw, 2.8rem) clamp(1.6rem, 1rem + 2.4vw, 3.2rem);
      background-color: var(--color-grey-0);
      border: 1px solid var(--color-grey-200);
      border-radius: var(--radius-cards);
      box-shadow: var(--shadow-subtle);
    `}

  ${(props) =>
    props.type === "modal" &&
    css`
      width: 80rem;
      max-width: 100%;
    `}

  font-size: 1.4rem;
`;

export default Form;
