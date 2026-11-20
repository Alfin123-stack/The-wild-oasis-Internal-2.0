"use client";

import styled, { css } from "styled-components";

const sizes = {
  // Tinggi ikut --control-h* (GlobalStyles): compact untuk mouse, >= 44px untuk layar sentuh.
  // Ukuran huruf tidak ikut membesar di HP; yang bertambah hanya area tekan.
  small: css`
    font-size: 1.3rem;
    min-height: var(--control-h-sm);
    min-width: var(--control-h-sm);
    padding: 0 1.2rem;
    font-weight: 500;
    text-align: center;
  `,
  medium: css`
    font-size: 1.4rem;
    min-height: var(--control-h);
    padding: 0 var(--control-pad-x);
    font-weight: 500;
  `,
  large: css`
    font-size: 1.5rem;
    min-height: var(--control-h-lg);
    padding: 0 2.4rem;
    font-weight: 500;
  `,
};

const variations = {
  // Aksi utama: navy
  primary: css`
    color: var(--color-action-text);
    background-color: var(--color-action-fill);
    border: 1px solid var(--color-action-fill);

    &:hover:not(:disabled) {
      background-color: var(--color-action-hover);
      border-color: var(--color-action-hover);
    }
  `,
  // Satu sorotan per layar: perunggu (check-in, simpan penting)
  accent: css`
    color: var(--color-on-accent);
    background-color: var(--color-accent-fill);
    border: 1px solid var(--color-accent-fill);

    &:hover:not(:disabled) {
      background-color: var(--color-accent-hover);
      border-color: var(--color-accent-hover);
    }
  `,
  secondary: css`
    color: var(--color-grey-800);
    background-color: transparent;
    border: 1px solid var(--color-grey-300);

    &:hover:not(:disabled) {
      background-color: var(--color-grey-100);
      border-color: var(--color-grey-400);
    }
  `,
  ghost: css`
    color: var(--color-grey-700);
    background-color: transparent;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background-color: var(--color-grey-100);
    }
  `,
  danger: css`
    color: var(--status-alert-fg);
    background-color: transparent;
    border: 1px solid var(--color-danger-border);

    &:hover:not(:disabled) {
      background-color: var(--status-alert-bg);
    }
  `,
};

// React 19 menghapus defaultProps: default ditangani di interpolasi.
const Button = styled.button.withConfig({
  // variation/size hanya untuk styling; jangan diteruskan ke DOM atau komponen `as` (mis. Link).
  shouldForwardProp: (prop) => !["variation", "size"].includes(prop),
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  border-radius: var(--radius-buttons);
  line-height: 1.25;
  letter-spacing: 0.01em;
  white-space: nowrap;
  transition: background-color var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast);

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  &:disabled {
    opacity: 0.5;
  }

  ${(props) => sizes[props.size] || sizes.medium}
  ${(props) => variations[props.variation] || variations.primary}
`;

export default Button;
