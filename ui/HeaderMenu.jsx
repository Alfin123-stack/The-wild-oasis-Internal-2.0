"use client";

import styled from "styled-components";
import ButtonIcon from "../ui/ButtonIcon";
import { HiOutlineMagnifyingGlass, HiOutlineUser } from "react-icons/hi2";
import Logout from "../features/authentication/Logout";
import { useRouter } from "next/navigation";
import DarkModeToggle from "./DarkModeToggle";
import { media } from "../styles/breakpoints";

const StyledHeaderMenu = styled.ul`
  display: flex;
  gap: 0.2rem;
  /* < 600px: header sudah punya ikon pencarian booking sendiri */
  ${media.down.medium} { & > li:first-child { display: none; } }
`;

function HeaderMenu() {
  const router = useRouter();
  return (
    <StyledHeaderMenu>
      <li>
        <ButtonIcon onClick={() => window.dispatchEvent(new Event("open-palette"))} aria-label="Search everything (Ctrl+K)" title="Search (Ctrl+K)">
          <HiOutlineMagnifyingGlass />
        </ButtonIcon>
      </li>
      <li>
        <ButtonIcon onClick={() => router.push("/account")} aria-label="Account">
          <HiOutlineUser />
        </ButtonIcon>
      </li>
      <li>
        <DarkModeToggle />
      </li>
      <li>
        <Logout />
      </li>
    </StyledHeaderMenu>
  );
}

export default HeaderMenu;
