"use client";

import styled, { keyframes } from "styled-components";

/*
 * Skeleton loading: hanya untuk KONTAINER (kartu, baris tabel, grafik, daftar), bukan untuk
 * tombol/input. Bentuknya meniru tata letak akhir supaya halaman tidak melompat saat data tiba.
 *
 * - Muncul dengan jeda 150 ms (CSS-only): pemuatan cepat tidak berkedip, ruang tetap dicadangkan.
 * - Shimmer pelan kiri -> kanan (1,8 dtk). Dengan prefers-reduced-motion jadi statis.
 * - Pembungkus memakai role="status" + aria-busy agar pembaca layar tahu sedang memuat.
 */

const appear = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shimmer = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
`;

const Region = styled.div`
  animation: ${appear} var(--dur-enter) ease-out 150ms both;
`;

const Hidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

export function SkeletonRegion({ label = "Loading…", children, ...rest }) {
  return (
    <Region role="status" aria-busy="true" aria-live="polite" {...rest}>
      <Hidden>{label}</Hidden>
      <div aria-hidden="true" style={{ display: "contents" }}>
        {children}
      </div>
    </Region>
  );
}

const Block = styled.span`
  position: relative;
  display: block;
  overflow: hidden;
  width: ${(p) => p.$w || "100%"};
  max-width: 100%;
  height: ${(p) => p.$h || "1.4rem"};
  border-radius: ${(p) => p.$r || "4px"};
  background-color: var(--skeleton-base);
  flex-shrink: 0;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, var(--skeleton-shine), transparent);
    animation: ${shimmer} 1.8s ease-in-out infinite;
  }
`;

export function Skeleton({ w, h, r }) {
  return <Block $w={w} $h={h} $r={r} />;
}

/* ---------- Komposisi siap pakai ---------- */

const Box = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-subtle);
  padding: var(--card-pad);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  min-width: 0;
`;

const Line = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

// Daftar baris (Bookings, Users, Cabins-tabel): 2 baris teks di kiri, blok kecil di kanan.
export function RowsSkeleton({ rows = 6, label }) {
  return (
    <SkeletonRegion label={label}>
      <Box style={{ padding: 0, gap: 0 }}>
        {Array.from({ length: rows }, (_, i) => (
          <RowItem key={i}>
            <Line style={{ flex: 1, minWidth: 0 }}>
              <Skeleton w={`${55 + ((i * 13) % 30)}%`} h="1.5rem" />
              <Skeleton w={`${30 + ((i * 7) % 25)}%`} h="1.2rem" />
            </Line>
            <Skeleton w="8rem" h="2.4rem" r="999px" />
          </RowItem>
        ))}
      </Box>
    </SkeletonRegion>
  );
}

const RowItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  padding: 1.6rem 2rem;
  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-200);
  }
`;

// Grid kartu (Cabins).
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 28rem), 1fr));
  gap: clamp(1.2rem, 0.8rem + 1.2vw, 2.4rem);
`;

export function CardGridSkeleton({ cards = 6 }) {
  return (
    <SkeletonRegion>
      <CardGrid>
        {Array.from({ length: cards }, (_, i) => (
          <Box key={i} style={{ padding: 0, gap: 0, overflow: "hidden" }}>
            <Skeleton h="16rem" r="0" />
            <div style={{ padding: "1.6rem var(--card-pad) var(--card-pad)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Skeleton w="40%" h="2rem" />
              <Skeleton w="65%" h="1.3rem" />
              <Skeleton w="30%" h="2rem" />
            </div>
          </Box>
        ))}
      </CardGrid>
    </SkeletonRegion>
  );
}

// Kartu KPI dashboard.
export function StatCardSkeleton() {
  return (
    <Box style={{ gap: "0.8rem" }}>
      <Skeleton w="45%" h="1.1rem" />
      <Skeleton w="60%" h="3rem" />
      <Skeleton w="11rem" h="3.4rem" />
      <Skeleton w="50%" h="1.2rem" />
    </Box>
  );
}

// Kotak grafik / panel dengan judul.
export function PanelSkeleton({ height = "24rem", lines = 0 }) {
  return (
    <Box>
      <Skeleton w="30%" h="1.8rem" />
      {lines ? (
        Array.from({ length: lines }, (_, i) => (
          <div key={i} style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
            <Skeleton w="4.4rem" h="4.4rem" r="6px" />
            <Line style={{ flex: 1 }}>
              <Skeleton w="60%" h="1.4rem" />
              <Skeleton w="35%" h="1.2rem" />
            </Line>
          </div>
        ))
      ) : (
        <Skeleton h={height} r="6px" />
      )}
    </Box>
  );
}

// Daftar kecil di dalam kartu yang sudah ada (Today / Upcoming): tanpa kotak tambahan.
export function ListSkeleton({ rows = 4 }) {
  return (
    <SkeletonRegion>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem", padding: "1.2rem var(--card-pad)" }}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
            <Skeleton w="4.4rem" h="4.4rem" r="6px" />
            <Line style={{ flex: 1 }}>
              <Skeleton w={`${50 + ((i * 11) % 30)}%`} h="1.4rem" />
              <Skeleton w="30%" h="1.2rem" />
            </Line>
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

// Halaman detail: judul + dua kolom (ringkasan + info).
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(28rem, 34rem) minmax(0, 1fr);
  gap: clamp(1.2rem, 0.8rem + 1.2vw, 2.4rem);
  @media (max-width: 839.98px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export function DetailSkeleton() {
  return (
    <SkeletonRegion>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--section-gap)" }}>
        <Line>
          <Skeleton w="min(28rem, 70%)" h="3rem" />
          <Skeleton w="min(20rem, 50%)" h="1.3rem" />
        </Line>
        <DetailGrid>
          <PanelSkeleton lines={0} height="30rem" />
          <PanelSkeleton lines={4} />
        </DetailGrid>
      </div>
    </SkeletonRegion>
  );
}

// Form pengaturan: kartu dengan beberapa baris label + isian.
export function FormSkeleton({ fields = 3 }) {
  return (
    <SkeletonRegion>
      <Box>
        <Skeleton w="25%" h="1.8rem" />
        {Array.from({ length: fields }, (_, i) => (
          <Line key={i}>
            <Skeleton w="35%" h="1.4rem" />
            <Skeleton h="3.4rem" r="6px" />
          </Line>
        ))}
      </Box>
    </SkeletonRegion>
  );
}

// Timeline: kolom cabin + baris dengan beberapa bar.
export function TimelineSkeleton({ rows = 7 }) {
  return (
    <SkeletonRegion>
      <Box style={{ padding: 0, gap: 0 }}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{ display: "flex", borderBottom: i < rows - 1 ? "1px solid var(--color-grey-200)" : 0 }}>
            <div style={{ width: "var(--timeline-label-w, 12rem)", padding: "1.4rem 1.6rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <Skeleton w="50%" h="1.4rem" />
              <Skeleton w="70%" h="1.1rem" />
            </div>
            <div style={{ flex: 1, padding: "1.4rem 1.2rem", display: "flex", alignItems: "center", gap: "1.2rem" }}>
              <Skeleton w={`${25 + ((i * 17) % 35)}%`} h="3.2rem" r="6px" />
              <Skeleton w={`${15 + ((i * 11) % 25)}%`} h="3.2rem" r="6px" />
            </div>
          </div>
        ))}
      </Box>
    </SkeletonRegion>
  );
}
