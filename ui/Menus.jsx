"use client";

/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";
import { HiEllipsisVertical } from "react-icons/hi2";
import styled, { keyframes } from "styled-components";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { createPortal } from "react-dom";
import { media } from "../styles/breakpoints";

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledToggle = styled.button.attrs({ type: "button" })`
  background: none;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--control-h-sm);
  min-height: var(--control-h-sm);
  padding: 0.4rem;
  border-radius: var(--radius-buttons);

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-600);
  }
`;

const menuIn = keyframes`from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; }`;
const sheetIn = keyframes`from { transform: translateY(100%); } to { transform: none; }`;
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const StyledList = styled.ul`
  animation: ${menuIn} var(--dur-fast) var(--ease-out);
  position: fixed;
  z-index: 1100;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-cards);
  padding: 0.4rem;
  min-width: 18rem;

  right: ${(props) => props.$position.x}px;
  top: ${(props) => props.$position.y}px;
  max-height: 70vh;
  overflow-y: auto;

  /* < 600px: bottom sheet */
  ${media.down.medium} {
    animation: ${sheetIn} var(--dur-enter) var(--ease-out);
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;
    min-width: 0;
    max-height: 80dvh;
    border-radius: 10px 10px 0 0;
    padding: 0.8rem 0.8rem calc(0.8rem + env(safe-area-inset-bottom));
    box-shadow: var(--shadow-lg);
  }
`;

const Scrim = styled.div`
  display: none;
  ${media.down.medium} {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1090;
    background-color: var(--backdrop-color);
    animation: ${fadeIn} var(--dur-enter) ease-out;
  }
`;

const StyledButton = styled.button.attrs({ type: "button" })`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  min-height: var(--control-h-sm);
  padding: 0 1.2rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-grey-800);
  border-radius: var(--radius-inputs);

  display: flex;
  align-items: center;
  gap: 1.2rem;

  &:hover:not(:disabled) {
    background-color: var(--color-grey-100);
  }

  &:disabled {
    opacity: 0.5;
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-bronze-strong);
  }
`;

const MenusContext = createContext();

function Menus({ children }) {
  const [isOpenId, setIsOpenId] = useState("");
  const [position, setPosition] = useState(null);

  const handleToggle = (id, e) => {
    e.stopPropagation();
    const rect = e.target.closest("button").getBoundingClientRect();
    setPosition({
      x: window.innerWidth - rect.width - rect.x,
      y: rect.y + rect.height + 8,
    });
    setIsOpenId(isOpenId === id ? "" : id);
  };

  const close = () => setIsOpenId("");

  return (
    <MenusContext.Provider value={{ isOpenId, handleToggle, position, close }}>
      {children}
    </MenusContext.Provider>
  );
}

function Toggle({ id }) {
  const { handleToggle } = useContext(MenusContext);
  return (
    <StyledToggle onClick={(e) => handleToggle(id, e)} aria-label="Actions">
      <HiEllipsisVertical />
    </StyledToggle>
  );
}

function List({ children, id }) {
  const { isOpenId, position, close } = useContext(MenusContext);
  const ref = useOutsideClick(close);

  if (isOpenId !== id) return null;

  return createPortal(
    <>
      <Scrim />
      <StyledList ref={ref} $position={position}>
        {children}
      </StyledList>
    </>,
    document.body
  );
}

function Button({ children, disabled, onClick }) {
  const { close } = useContext(MenusContext);
  return (
    <li>
      {/* Menu ditutup setelah item dipilih, supaya tidak menumpuk di atas modal */}
      <StyledButton
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          close();
        }}>
        {children}
      </StyledButton>
    </li>
  );
}

Menus.Menu = Menu;
Menus.Toggle = Toggle;
Menus.List = List;
Menus.Button = Button;

export default Menus;
