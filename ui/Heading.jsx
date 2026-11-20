"use client";

import styled, { css } from "styled-components";

// Serif (Caudex) untuk h1/h2/h4, sans untuk h3. h1 punya garis perunggu kecil.
const Heading = styled.h1`
  color: var(--color-grey-800);

  ${(props) =>
    props.as === "h1" &&
    css`
      font-family: var(--font-serif);
      font-size: var(--text-page);
      line-height: 1.2;
      font-weight: 700;
      letter-spacing: -0.005em;

      &::after {
        content: "";
        display: block;
        width: 4rem;
        height: 2px;
        margin-top: 0.8rem;
        background-color: var(--color-bronze);
      }
    `}

  ${(props) =>
    props.as === "h2" &&
    css`
      font-family: var(--font-serif);
      font-size: var(--text-heading);
      line-height: 1.3;
      font-weight: 700;
    `}

  ${(props) =>
    props.as === "h3" &&
    css`
      font-size: var(--text-title);
      line-height: 1.4;
      font-weight: 600;
    `}

  ${(props) =>
    props.as === "h4" &&
    css`
      font-family: var(--font-sans);
      font-size: var(--text-kpi);
      line-height: 1.1;
      font-weight: 700;
    `}
`;

export default Heading;
