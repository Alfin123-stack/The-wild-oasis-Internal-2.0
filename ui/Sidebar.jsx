"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi2";
import Logo from "./Logo";
import MainNav from "./MainNav";
import { media } from "../styles/breakpoints";

const StyledSidebar = styled.aside`
  grid-row: 1 / -1;
  background-color: var(--color-sidebar);
  color: var(--color-sidebar-text);
  padding: 2.4rem 1.2rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 2.8rem;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.04);

  /* < 840px: drawer geser dari kiri */
  ${media.down.expanded} {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(var(--sidebar-width), 86vw);
    z-index: 900;
    padding-top: calc(2.4rem + env(safe-area-inset-top));
    padding-bottom: calc(1.6rem + env(safe-area-inset-bottom));
    transform: translateX(${(p) => (p.$open ? "0" : "-100%")});
    visibility: ${(p) => (p.$open ? "visible" : "hidden")};
    transition: transform 0.25s ease, visibility 0s linear ${(p) => (p.$open ? "0s" : "0.25s")};
    box-shadow: ${(p) => (p.$open ? "var(--shadow-lg)" : "none")};
    overscroll-behavior: contain;
  }
`;

const Brand = styled.div`
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(212, 164, 95, 0.25);
`;

const Spacer = styled.div`
  flex: 1;
`;

const Toggle = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: none;
  border: none;
  color: var(--color-sidebar-muted);
  font-size: 1.3rem;
  min-height: var(--control-h);
  padding: 0 1.4rem;
  border-radius: var(--radius-buttons);
  justify-content: ${(p) => (p.$collapsed ? "center" : "flex-start")};

  &:hover { background-color: var(--color-sidebar-hover); color: var(--color-sidebar-text); }
  & svg { width: 1.8rem; height: 1.8rem; }

  ${media.down.expanded} { display: none; }
`;

function Sidebar({ collapsed, canToggle = true, onToggle, open, onNavigate }) {
  // Drawer (<840px) selalu penuh; rail (840-1199px) otomatis; tombol lipat hanya di >= 1200px.
  const isCollapsed = collapsed;
  return (
    <StyledSidebar $open={open} aria-label="Sidebar">
      <Brand>
        <Logo small={isCollapsed} />
      </Brand>
      <MainNav collapsed={isCollapsed} onNavigate={onNavigate} />
      <Spacer />
      {canToggle && (
        <Toggle onClick={onToggle} $collapsed={isCollapsed} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {isCollapsed ? <HiChevronDoubleRight /> : <><HiChevronDoubleLeft /> Collapse</>}
        </Toggle>
      )}
    </StyledSidebar>
  );
}

export default Sidebar;
