"use client";

import styled from "styled-components";

// Label kecil persegi dengan titik. type: blue | green | yellow | silver | indigo | red
const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  width: fit-content;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-tags);

  color: var(--color-${(props) => props.type || "silver"}-700);
  background-color: var(--color-${(props) => props.type || "silver"}-100);

  &::before {
    content: "";
    width: 0.6rem;
    height: 0.6rem;
    border-radius: var(--radius-full);
    background-color: currentColor;
  }
`;

export default Tag;
