"use client";

/* eslint-disable react/prop-types */
import { cloneElement, createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import styled, { keyframes } from "styled-components";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { media } from "../styles/breakpoints";

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const popIn = keyframes`
  from { opacity: 0; transform: translate(-50%, calc(-50% + 8px)); }
  to { opacity: 1; transform: translate(-50%, -50%); }
`;
const sheetIn = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const StyledModal = styled.div`
  animation: ${popIn} var(--dur-enter) var(--ease-out);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: calc(100vw - 3.2rem);
  max-height: calc(100vh - 3.2rem);
  max-height: calc(100dvh - 3.2rem);
  overflow: auto;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-top: 3px solid var(--color-bronze);
  border-radius: var(--radius-largecards);
  box-shadow: var(--shadow-subtle-2);
  padding: 3.2rem 3.6rem;

  /* < 600px: bottom sheet penuh lebar, mudah dijangkau ibu jari */
  ${media.down.medium} {
    animation-name: ${sheetIn};
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    transform: none;
    width: 100%;
    max-width: 100%;
    max-height: 92vh;
    max-height: 92dvh;
    border-radius: 10px 10px 0 0;
    padding: 2.4rem 1.6rem calc(2rem + env(safe-area-inset-bottom));
    overscroll-behavior: contain;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background-color: var(--backdrop-color);
  animation: ${fadeIn} var(--dur-enter) ease-out;
  backdrop-filter: blur(3px);
  z-index: 1000;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: var(--radius-buttons);
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--control-h-sm);
  min-height: var(--control-h-sm);

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-500);
  }
`;

const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState("");
  const handleOpen = (name) => setOpenName(name);
  const handleClose = () => setOpenName("");

  return (
    <ModalContext.Provider value={{ openName, handleOpen, handleClose }}>
      {children}
    </ModalContext.Provider>
  );
}

function Window({ children, names: windowName }) {
  const { handleClose, openName } = useContext(ModalContext);
  const ref = useOutsideClick(handleClose);

  if (windowName !== openName) return null;

  return createPortal(
    <Overlay>
      <StyledModal ref={ref} role="dialog" aria-modal="true">
        <CloseButton onClick={handleClose} aria-label="Close">
          <HiXMark />
        </CloseButton>
        <div>{cloneElement(children, { onClose: handleClose })}</div>
      </StyledModal>
    </Overlay>,
    document.body
  );
}

function Open({ children, opens: openWindowName }) {
  const { handleOpen } = useContext(ModalContext);
  return cloneElement(children, { onClick: () => handleOpen(openWindowName) });
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
