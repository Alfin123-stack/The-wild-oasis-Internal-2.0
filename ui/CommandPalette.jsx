"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { HiMagnifyingGlass } from "react-icons/hi2";
import useUser from "../features/authentication/useUser";
import { globalSearch } from "../services/apiExtra";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: var(--backdrop-color);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(2rem, 12vh, 10rem) 1.6rem 1.6rem;
  animation: palette-fade var(--dur-enter) var(--ease-out) both;
  @keyframes palette-fade { from { opacity: 0; } }
`;

const Box = styled.div`
  width: 60rem;
  max-width: 100%;
  max-height: 70dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-lg, 0 20px 50px rgba(0, 0, 0, 0.25));
  overflow: hidden;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.4rem;
  border-bottom: 1px solid var(--color-grey-200);
  & svg { width: 2rem; height: 2rem; color: var(--color-grey-400); flex-shrink: 0; }
  & input {
    flex: 1;
    min-height: 5rem;
    border: none;
    background: transparent;
    color: var(--color-grey-800);
    outline: none;
  }
`;

const List = styled.ul`
  list-style: none;
  overflow-y: auto;
  padding: 0.6rem;
`;

const Group = styled.li`
  padding: 1rem 1rem 0.4rem;
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-grey-500);
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  min-height: var(--control-h);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-inputs);
  cursor: pointer;
  font-size: var(--text-body);
  color: var(--color-grey-800);
  background: ${(p) => (p.$active ? "var(--color-bronze-tint)" : "transparent")};
  & small { color: var(--color-grey-500); font-size: var(--text-caption); }
  & kbd {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    padding: 0.1rem 0.6rem;
    border: 1px solid var(--color-grey-300);
    border-radius: 0.4rem;
    color: var(--color-grey-500);
    white-space: nowrap;
  }
`;

const Foot = styled.p`
  padding: 0.8rem 1.4rem;
  border-top: 1px solid var(--color-grey-200);
  font-size: var(--text-caption);
  color: var(--color-grey-500);
`;

const isTyping = (el) =>
  el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

const GO = { d: "/dashboard", b: "/bookings", t: "/bookings/timeline", c: "/cabins", u: "/guests", a: "/assistant" };

function CommandPalette() {
  const router = useRouter();
  const { isAdmin } = useUser();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const prevFocus = useRef(null);
  const goPending = useRef(false);

  const openIt = useCallback(() => {
    prevFocus.current = document.activeElement;
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    prevFocus.current?.focus?.();
  }, []);

  // Pintasan global. Pintasan satu huruf dimatikan saat mengetik di kolom isian.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open ? close() : openIt();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target) || open) return;
      const k = e.key.toLowerCase();
      if (goPending.current) {
        goPending.current = false;
        if (GO[k]) {
          e.preventDefault();
          router.push(GO[k]);
        }
        return;
      }
      if (k === "/" || k === "?") { e.preventDefault(); openIt(); }
      else if (k === "n") { e.preventDefault(); router.push("/bookings/new"); }
      else if (k === "g") {
        goPending.current = true;
        setTimeout(() => (goPending.current = false), 1200);
      }
    };
    const onOpen = () => openIt();
    document.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", onOpen);
    };
  }, [open, close, openIt, router]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDq(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);

  const search = useQuery({
    queryKey: ["search", dq],
    queryFn: () => globalSearch(dq),
    enabled: open && dq.length >= 2,
    staleTime: 30_000,
  });

  const commands = useMemo(
    () => [
      { label: "New booking", hint: "N", href: "/bookings/new" },
      { label: "Go to Dashboard", hint: "G D", href: "/dashboard" },
      { label: "Go to Bookings", hint: "G B", href: "/bookings" },
      { label: "Go to Timeline", hint: "G T", href: "/bookings/timeline" },
      { label: "Go to Guests", hint: "G U", href: "/guests" },
      { label: "Go to Cabins", hint: "G C", href: "/cabins" },
      { label: "Open Assistant", hint: "G A", href: "/assistant" },
      ...(isAdmin ? [{ label: "Go to Activity", href: "/activity" }, { label: "Go to Settings", href: "/settings" }] : []),
    ],
    [isAdmin]
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = [];
    const cmds = commands.filter((c) => !term || c.label.toLowerCase().includes(term));
    if (cmds.length) out.push({ group: "Actions" }, ...cmds.map((c) => ({ ...c })));
    const d = search.data;
    if (d && dq.length >= 2) {
      if (d.bookings.length)
        out.push({ group: "Bookings" }, ...d.bookings.map((b) => ({ label: `${b.guest} · ${b.cabin}`, sub: `${b.startDate} to ${b.endDate} · ${b.status}`, href: `/bookings/${b.id}` })));
      if (d.guests.length)
        out.push({ group: "Guests" }, ...d.guests.map((g) => ({ label: g.fullName, sub: g.email, href: `/bookings?q=${encodeURIComponent(g.email)}` })));
      if (d.cabins.length)
        out.push({ group: "Cabins" }, ...d.cabins.map((c) => ({ label: c.name, href: "/cabins" })));
    }
    if (term.length >= 3) out.push({ group: "Assistant" }, { label: `Ask: “${q.trim()}”`, sub: "Opens the assistant", href: `/assistant?q=${encodeURIComponent(q.trim())}` });
    return out;
  }, [q, commands, search.data, dq]);

  const selectable = rows.map((r, i) => (r.group ? -1 : i)).filter((i) => i >= 0);
  useEffect(() => setActive(0), [q, search.data]);

  function choose(row) {
    if (!row?.href) return;
    close();
    router.push(row.href);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, selectable.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(rows[selectable[active]]); }
  }

  if (!open) return null;
  const activeIdx = selectable[active];

  return (
    <Overlay onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <Box role="dialog" aria-modal="true" aria-label="Search and commands" onKeyDown={onKeyDown}>
        <Top>
          <HiMagnifyingGlass aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search guests, bookings, cabins, or type a command"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={activeIdx >= 0 ? `palette-${activeIdx}` : undefined}
            autoComplete="off"
          />
        </Top>
        <List id="palette-list" role="listbox">
          {rows.map((r, i) =>
            r.group ? (
              <Group key={`g${i}`} role="presentation">{r.group}</Group>
            ) : (
              <Item key={i} id={`palette-${i}`} role="option" aria-selected={i === activeIdx} $active={i === activeIdx} onMouseMove={() => setActive(selectable.indexOf(i))} onClick={() => choose(r)}>
                <span>
                  {r.label}
                  {r.sub && <><br /><small>{r.sub}</small></>}
                </span>
                {r.hint && <kbd>{r.hint}</kbd>}
              </Item>
            )
          )}
          {search.isFetching && <Group role="presentation">Searching…</Group>}
          {dq.length >= 2 && search.data && !rows.some((r) => ["Bookings", "Guests", "Cabins"].includes(r.group)) && !search.isFetching && (
            <Group role="presentation">No guests, bookings or cabins found</Group>
          )}
        </List>
        <Foot>↑ ↓ to move · Enter to open · Esc to close · Ctrl K from anywhere</Foot>
      </Box>
    </Overlay>
  );
}

export default CommandPalette;
