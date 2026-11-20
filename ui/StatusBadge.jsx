"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import { statusLabel, statusTone } from "../utils/status";

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  width: fit-content;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-tags);
  color: var(--status-${(p) => p.$tone}-fg);
  background-color: var(--status-${(p) => p.$tone}-bg);

  &::before {
    content: "";
    width: 0.6rem;
    height: 0.6rem;
    border-radius: var(--radius-full);
    background-color: currentColor;
  }
`;

// <StatusBadge status="checked-in" /> atau <StatusBadge tone="arriving">Arriving</StatusBadge>
function StatusBadge({ status, tone, children }) {
  return (
    <Badge $tone={tone || statusTone(status)}>
      {children || statusLabel(status)}
    </Badge>
  );
}

export default StatusBadge;
