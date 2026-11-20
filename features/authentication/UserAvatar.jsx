"use client";

import styled from "styled-components";
import useUser from "./useUser";

const StyledUserAvatar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  font-weight: 500;
  font-size: 1.3rem;
  color: var(--color-grey-800);
`;

const Avatar = styled.img`
  display: block;
  width: 3.4rem;
  aspect-ratio: 1;
  object-fit: cover;
  object-position: center;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-bronze-tint);
  outline: 1px solid var(--color-bronze);
`;

function UserAvatar() {
  const { user } = useUser();
  if (!user) return null;
  const { fullName, avatar } = user;
  return (
    <StyledUserAvatar>
      <Avatar src={avatar || "/default-user.jpg"} alt={`Avatar of ${fullName}`} />
      <span>{fullName}</span>
    </StyledUserAvatar>
  );
}

export default UserAvatar;
