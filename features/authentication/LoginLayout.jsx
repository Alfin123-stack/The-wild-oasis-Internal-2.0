"use client";

import styled from "styled-components";
import LoginForm from "./LoginForm";
import Heading from "../../ui/Heading";
import { media } from "../../styles/breakpoints";

const Layout = styled.main`
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  background-color: var(--color-canvas);

  ${media.down.expanded} { grid-template-columns: minmax(0, 1fr); }
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #1f2a44 0%, #2a3757 62%, #3b3a45 100%);
  color: #e9e3d4;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4.8rem 5.6rem;

  & img.logo { height: 11rem; width: auto; align-self: flex-start; filter: none; }

  & blockquote {
    position: relative;
    z-index: 1;
    font-family: var(--font-serif);
    font-size: clamp(2.8rem, 1.8rem + 1.6vw, 3.6rem);
    line-height: 1.15;
    max-width: 36rem;
    margin-bottom: 18rem;
  }

  & blockquote small {
    display: block;
    margin-top: 1.6rem;
    font-family: var(--font-sans);
    font-size: 1.2rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #d4a45f;
  }

  ${media.down.expanded} { display: none; }
`;

const Scene = styled.svg`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 46%;
`;

const Pane = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 1rem + 3vw, 4rem) var(--page-pad-x);
  padding-bottom: calc(clamp(2rem, 1rem + 3vw, 4rem) + env(safe-area-inset-bottom));
  align-items: flex-start;

  ${media.up.expanded} { align-items: center; }
`;

const Box = styled.div`
  width: 100%;
  max-width: 42rem;
  display: flex;
  flex-direction: column;
  gap: 2.8rem;

  & p.lead { color: var(--color-grey-500); font-size: var(--text-body-lg); margin-top: 1rem; }
`;

const Mobile = styled.img`
  display: none;
  height: 8rem;
  width: auto;
  background-color: var(--color-sidebar);
  padding: 0.8rem 1.6rem;
  border-radius: var(--radius-cards);
  align-self: flex-start;
  filter: none;
  ${media.down.expanded} { display: block; }
`;

function LoginLayout() {
  return (
    <Layout>
      <Hero>
        <img className="logo" src="/logo-dark.png" alt="The Wild Oasis" />
        <blockquote>
          Every guest, every cabin, every morning — in one calm place.
          <small>Staff dashboard</small>
        </blockquote>
        <Scene viewBox="0 0 800 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M0 250 L120 130 L200 200 L330 70 L470 210 L560 140 L680 220 L800 160 V360 H0Z" fill="#33405f" />
          <path d="M0 290 L90 220 L170 270 L290 180 L420 280 L540 210 L660 285 L800 230 V360 H0Z" fill="#26314d" />
          <path d="M0 320 Q200 280 400 315 T800 300 V360 H0Z" fill="#1a2238" />
          {[60, 130, 610, 690, 750].map((x, i) => (
            <polygon key={x} points={`${x},${250 - (i % 2) * 18} ${x - 22},330 ${x + 22},330`} fill="#141b2e" />
          ))}
          <g transform="translate(335 238)">
            <rect x="0" y="40" width="130" height="62" fill="#a4793f" />
            <polygon points="-12,42 65,0 142,42" fill="#6f4f27" />
            <rect x="52" y="64" width="26" height="38" fill="#3b2a15" />
            <rect x="14" y="54" width="22" height="18" fill="#f3e0b5" />
            <rect x="94" y="54" width="22" height="18" fill="#f3e0b5" />
          </g>
          <circle cx="640" cy="70" r="26" fill="#f3e0b5" opacity="0.85" />
        </Scene>
      </Hero>

      <Pane>
        <Box>
          <Mobile src="/logo-dark.png" alt="The Wild Oasis" />
          <div>
            <Heading as="h1">Welcome back</Heading>
            <p className="lead">Sign in with your staff account to continue.</p>
          </div>
          <LoginForm />
        </Box>
      </Pane>
    </Layout>
  );
}

export default LoginLayout;
