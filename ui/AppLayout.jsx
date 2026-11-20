"use client";

import CommandPalette from "./CommandPalette";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { media } from "../styles/breakpoints";

const StyledAppLayout = styled.div`
  display: grid;
  grid-template-columns: ${(p) => (p.$collapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)")} minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  height: 100vh;
  height: 100dvh;
  transition: grid-template-columns 0.2s ease;

  /* < 840px: sidebar menjadi drawer */
  ${media.down.expanded} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Main = styled.main`
  background-color: var(--color-canvas);
  padding: var(--page-pad-y) var(--page-pad-x) calc(var(--page-pad-y) + 2.4rem);
  padding-bottom: calc(var(--page-pad-y) + 2.4rem + env(safe-area-inset-bottom));
  overflow: auto;
  min-width: 0;
  min-height: 0;
`;

const Container = styled.div.attrs({ className: "enter" })`
  display: flex;
  margin: 0 auto;
  max-width: var(--page-max-width);
  gap: var(--section-gap);
  flex-direction: column;
  min-width: 0;
`;

const Scrim = styled.div`
  display: none;
  ${media.down.expanded} {
    display: ${(p) => (p.$open ? "block" : "none")};
    position: fixed;
    inset: 0;
    background-color: var(--backdrop-color);
    z-index: 800;
  }
`;

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 840-1199px: sidebar otomatis jadi rail (ikon saja). >= 1200px: ikut pilihan pengguna.
  const isRailWidth = useMediaQuery("(min-width: 840px) and (max-width: 1199.98px)");
  const isDrawer = useMediaQuery("(max-width: 839.98px)");
  const effectiveCollapsed = !isDrawer && (isRailWidth || collapsed);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("sidebarCollapsed") === "1");
    } catch {}
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Esc menutup drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function toggle() {
    setCollapsed((c) => {
      try {
        localStorage.setItem("sidebarCollapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });
  }

  return (
    <StyledAppLayout $collapsed={effectiveCollapsed}>
      <Header onOpenMenu={() => setOpen(true)} />
      <Sidebar
        collapsed={effectiveCollapsed}
        canToggle={!isRailWidth && !isDrawer}
        onToggle={toggle}
        open={open}
        onNavigate={() => setOpen(false)}
      />
      <Scrim $open={open} onClick={() => setOpen(false)} />
      <CommandPalette />
      <Main>
        <Container key={pathname}>
          <Suspense fallback={null}>{children}</Suspense>
        </Container>
      </Main>
    </StyledAppLayout>
  );
}

export default AppLayout;
