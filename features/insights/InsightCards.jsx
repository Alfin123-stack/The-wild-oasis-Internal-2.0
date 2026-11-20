"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getInsights } from "../../services/apiExtra";
import { todayKey } from "../../utils/dates";
import { SkeletonRegion, PanelSkeleton } from "../../ui/Skeleton";

const Row = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: clamp(1.2rem, 0.8rem + 1vw, 2rem);
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: var(--card-pad);
  border: 1px solid var(--color-grey-200);
  border-left: 4px solid var(--status-${(p) => (p.$tone === "alert" ? "alert" : p.$tone === "warn" ? "unconfirmed" : "ok")}-fg);
  border-radius: var(--radius-cards);
  background: var(--color-grey-0);
  box-shadow: var(--shadow-subtle);
  color: inherit;
  text-decoration: none;
  min-width: 0;

  &:hover { border-color: var(--color-grey-300); }

  & h3 { font-size: var(--text-body); font-weight: 600; color: var(--color-grey-600); }
  & strong { font-size: var(--text-kpi); font-variant-numeric: tabular-nums; line-height: 1.1; }
  & p { font-size: var(--text-caption); color: var(--color-grey-500); }
  & ul { list-style: none; font-size: 1.3rem; color: var(--color-grey-700); display: flex; flex-direction: column; gap: 0.2rem; }
`;

const label = (i) => i.label || `${i.guest} · ${i.cabin} · ${i.startDate}`;

// Kartu berbasis aturan (tanpa AI). Tiap kartu menampilkan angka, aturannya, dan tautan ke daftar.
function InsightCards() {
  const { data, isPending, error } = useQuery({ queryKey: ["insights", todayKey()], queryFn: () => getInsights(todayKey()) });
  if (isPending) {
    return (
      <SkeletonRegion label="Loading insights…" style={{ display: "contents" }}>
        <PanelSkeleton lines={2} />
      </SkeletonRegion>
    );
  }
  if (error || !Array.isArray(data?.cards)) return null;
  return (
    <Row aria-label="Things that need attention" className="enter-list">
      {data.cards.map((c) => (
        <Card key={c.id} href={c.href} $tone={c.tone}>
          <h3>{c.title}</h3>
          <strong>{c.value}</strong>
          <p>{c.rule}</p>
          {c.items.length > 0 && (
            <ul>
              {c.items.slice(0, 3).map((i, n) => (
                <li key={i.id || n}>{label(i)}</li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </Row>
  );
}

export default InsightCards;
