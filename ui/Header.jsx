"use client";

/* eslint-disable react/prop-types */
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";
import { HiBars3, HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import ButtonIcon from "./ButtonIcon";
import { media } from "../styles/breakpoints";
import HeaderMenu from "./HeaderMenu";
import UserAvatar from "../features/authentication/UserAvatar";

const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 1.2rem 2rem;
  background-color: var(--color-canvas);
  border-bottom: 1px solid var(--color-grey-200);
  padding: 1rem var(--page-pad-x);
  padding-top: calc(1rem + env(safe-area-inset-top));
  min-width: 0;

  ${media.down.medium} {
    gap: 0.8rem;
  }
`;

const Burger = styled(ButtonIcon)`
  display: none;
  margin-left: -0.6rem;
  & svg { width: 2.4rem; height: 2.4rem; color: var(--color-grey-700); }
  ${media.down.expanded} { display: inline-flex; }
  ${media.down.medium} { ${(p) => p.$hidden && "display: none;"} }
`;

const Crumb = styled.div`
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-grey-500);
  white-space: nowrap;

  & b { color: var(--color-bronze-strong); font-weight: 600; }
  ${media.down.medium} { display: none; }
`;

const SearchToggle = styled(ButtonIcon)`
  display: none;
  margin-left: auto;
  ${media.down.medium} { display: ${(p) => (p.$hidden ? "none" : "inline-flex")}; }
`;

const Search = styled.form`
  position: relative;
  flex: 1;
  max-width: 44rem;
  margin-left: auto;

  & svg {
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-grey-400);
    pointer-events: none;
  }

  & input {
    width: 100%;
    min-height: var(--control-h);
    padding: 0 1.2rem 0 3.8rem;
    border: 1px solid var(--color-grey-200);
    background-color: var(--color-grey-0);
    border-radius: var(--radius-buttons);
    font-size: 1.3rem;
  }

  & input:focus {
    outline: none;
    border-color: var(--color-bronze);
    box-shadow: 0 0 0 3px var(--color-bronze-tint);
  }

  /* < 600px: pencarian disembunyikan; muncul penuh lebar saat ikon ditekan */
  ${media.down.medium} {
    display: ${(p) => (p.$open ? "block" : "none")};
    max-width: none;
    margin-left: 0;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  ${media.down.medium} {
    gap: 0;
    ${(p) => p.$hidden && "display: none;"}
    & > div:first-child { display: none; }
  }
`;

const SECTIONS = [
  ["/dashboard", "Front office", "Dashboard"],
  ["/bookings/timeline", "Front office", "Timeline"],
  ["/bookings", "Front office", "Bookings"],
  ["/check-in", "Front office", "Check in"],
  ["/guests", "Front office", "Guests"],
  ["/cabins", "Property", "Cabins"],
  ["/assistant", "Tools", "Assistant"],
  ["/activity", "Admin", "Activity"],
  ["/users", "Admin", "Users"],
  ["/settings", "Admin", "Settings"],
  ["/account", "Admin", "Account"],
];

function Header({ onOpenMenu }) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const match = SECTIONS.find(([p]) => pathname === p || pathname.startsWith(p + "/"));

  function handleSearch(e) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/bookings?q=${encodeURIComponent(term)}` : "/bookings");
    setSearchOpen(false);
  }

  return (
    <StyledHeader>
      <Burger $hidden={searchOpen} onClick={onOpenMenu} aria-label="Open menu">
        <HiBars3 />
      </Burger>
      {match && (
        <Crumb>
          {match[1]} / <b>{match[2]}</b>
        </Crumb>
      )}
      <SearchToggle $hidden={searchOpen} onClick={() => setSearchOpen(true)} aria-label="Search bookings">
        <HiMagnifyingGlass />
      </SearchToggle>
      <Search $open={searchOpen} onSubmit={handleSearch} role="search">
        <HiMagnifyingGlass />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search guest name or email"
          aria-label="Search bookings"
          autoFocus={searchOpen}
        />
      </Search>
      {searchOpen && (
        <SearchToggle as="button" type="button" $hidden={false} onClick={() => setSearchOpen(false)} aria-label="Close search" style={{ marginLeft: 0 }}>
          <HiXMark />
        </SearchToggle>
      )}
      <Right $hidden={searchOpen}>
        <UserAvatar />
        <HeaderMenu />
      </Right>
    </StyledHeader>
  );
}

export default Header;
