"use client";

/* eslint-disable react/prop-types */
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import useUser from "../features/authentication/useUser";
import {
  HiOutlineCalendarDays,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiOutlineViewColumns,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  & + & { margin-top: 2.4rem; }
`;

const GroupTitle = styled.p`
  padding: 0 1.4rem 0.8rem;
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-sidebar-muted);
  white-space: nowrap;
  overflow: hidden;
  ${(p) => p.$collapsed && "visibility: hidden; height: 1.6rem; padding-bottom: 0;"}
`;

const StyledLink = styled(Link)`
  &:link,
  &:visited {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    color: var(--color-sidebar-text);
    font-size: 1.4rem;
    font-weight: 500;
    min-height: var(--control-h);
    padding: 0 1.4rem;
    border-radius: var(--radius-buttons);
    white-space: nowrap;
    justify-content: ${(p) => (p.$collapsed ? "center" : "flex-start")};
  }

  &:hover:link,
  &:hover:visited {
    background-color: var(--color-sidebar-hover);
  }

  &.active:link,
  &.active:visited {
    background-color: var(--color-sidebar-hover);
    color: #fffdf9;
  }

  &.active::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.6rem;
    bottom: 0.6rem;
    width: 3px;
    background-color: var(--color-bronze);
    border-radius: 0 2px 2px 0;
  }

  & svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    color: var(--color-sidebar-muted);
  }

  &:hover svg,
  &.active svg {
    color: #d4a45f;
  }

  & span {
    ${(p) => p.$collapsed && "display: none;"}
  }
`;

function NavLink({ to, icon, label, collapsed, exclude, onNavigate }) {
  const pathname = usePathname();
  const inTree = pathname === to || pathname.startsWith(to + "/");
  const isActive = inTree && !(exclude && pathname.startsWith(exclude));
  return (
    <StyledLink
      href={to}
      className={isActive ? "active" : undefined}
      $collapsed={collapsed}
      title={collapsed ? label : undefined}
      onClick={onNavigate}>
      {icon}
      <span>{label}</span>
    </StyledLink>
  );
}

function MainNav({ collapsed = false, onNavigate }) {
  const common = { collapsed, onNavigate };
  const { isAdmin } = useUser();
  return (
    <nav aria-label="Main">
      <Group>
        <GroupTitle $collapsed={collapsed}>Front office</GroupTitle>
        <NavLink to="/dashboard" icon={<HiOutlineHome />} label="Dashboard" {...common} />
        <NavLink to="/bookings" icon={<HiOutlineCalendarDays />} label="Bookings" exclude="/bookings/timeline" {...common} />
        <NavLink to="/bookings/timeline" icon={<HiOutlineViewColumns />} label="Timeline" {...common} />
        <NavLink to="/guests" icon={<HiOutlineUserGroup />} label="Guests" {...common} />
      </Group>
      <Group>
        <GroupTitle $collapsed={collapsed}>Property</GroupTitle>
        <NavLink to="/cabins" icon={<HiOutlineHomeModern />} label="Cabins" {...common} />
      </Group>
      <Group>
        <GroupTitle $collapsed={collapsed}>Tools</GroupTitle>
        <NavLink to="/assistant" icon={<HiOutlineSparkles />} label="Assistant" {...common} />
      </Group>
      {isAdmin && (
        <Group>
          <GroupTitle $collapsed={collapsed}>Admin</GroupTitle>
          <NavLink to="/activity" icon={<HiOutlineClipboardDocumentList />} label="Activity" {...common} />
          <NavLink to="/users" icon={<HiOutlineUsers />} label="Users" {...common} />
          <NavLink to="/settings" icon={<HiOutlineCog6Tooth />} label="Settings" {...common} />
        </Group>
      )}
    </nav>
  );
}

export default MainNav;
