"use client";

import styled from "styled-components";

const StyledLogo = styled.div`
  text-align: center;
`;

const Img = styled.img`
  height: ${(p) => (p.$small ? "4.4rem" : "9rem")};
  width: auto;
  /* logo hanya dipakai di atas latar navy: jangan diredupkan mode gelap */
  filter: none !important;
`;

function Logo({ small = false }) {
  return (
    <StyledLogo>
      <Img src="/logo-dark.png" alt="The Wild Oasis" $small={small} />
    </StyledLogo>
  );
}

export default Logo;
