"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import SpinnerMini from "../../ui/SpinnerMini";
import useUser from "../authentication/useUser";
import { askAi, getAiStatus, getPriceSuggestions, getWeeklyReport } from "../../services/apiExtra";
import { todayKey, fmtUTC } from "../../utils/dates";
import { formatCurrency } from "../../utils/helpers";
import { STATUS_META } from "../../utils/status";
import { media } from "../../styles/breakpoints";

const Tabs = styled.div`
  display: flex;
  gap: 0.4rem;
  margin: 2rem 0;
  border-bottom: 1px solid var(--color-grey-200);
  overflow-x: auto;
  & button {
    min-height: var(--control-h);
    padding: 0 1.4rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--color-grey-500);
    font-weight: 500;
    white-space: nowrap;
  }
  & button[aria-selected="true"] { color: var(--color-bronze-strong); border-bottom-color: var(--color-bronze); font-weight: 600; }
`;

const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  max-width: 96rem;
`;

const AskRow = styled.form`
  display: flex;
  gap: 1rem;
  ${media.down.medium} { flex-direction: column; & > button { width: 100%; } }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  & button {
    min-height: var(--control-h-sm);
    padding: 0 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--radius-full);
    background: var(--color-grey-0);
    color: var(--color-grey-700);
    font-size: 1.3rem;
  }
  & button:hover { border-color: var(--color-bronze); }
`;

const Answer = styled.article`
  padding: var(--card-pad);
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-subtle);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  & h3 { font-size: var(--text-body); color: var(--color-grey-500); font-weight: 600; }
  & p { font-size: var(--text-body-lg); line-height: 1.5; white-space: pre-wrap; }
  & ul { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; margin: 0; padding: 0; }
  & li { font-size: var(--text-body); line-height: 1.45; padding: 0.8rem 1.2rem; background: var(--color-grey-50); border: 1px solid var(--color-grey-200); border-left: 3px solid var(--color-bronze); border-radius: var(--radius-inputs); }
  & li strong, & p strong { font-weight: 600; color: var(--color-grey-900); }
  & small { color: var(--color-grey-500); font-size: var(--text-caption); }
`;

const Scroll = styled.div`
  overflow-x: auto;
  & table { border-collapse: collapse; width: 100%; font-size: 1.3rem; font-variant-numeric: tabular-nums; }
  & th, & td { text-align: left; padding: 0.7rem 1rem; border-bottom: 1px solid var(--color-grey-200); white-space: nowrap; }
  & th { color: var(--color-grey-500); font-weight: 600; font-size: var(--text-caption); text-transform: uppercase; letter-spacing: 0.06em; }

  /* Ponsel: setiap baris jadi kartu kecil, tanpa gulir samping */
  ${media.down.medium} {
    & table.stack, & table.stack tbody, & table.stack tr, & table.stack td { display: block; width: 100%; }
    & table.stack thead { display: none; }
    & table.stack tr { padding: 1rem 0; border-bottom: 1px solid var(--color-grey-200); }
    & table.stack td { border: none; padding: 0.3rem 0; white-space: normal; display: flex; justify-content: space-between; gap: 1.2rem; }
    & table.stack td::before { content: attr(data-label); color: var(--color-grey-500); font-size: var(--text-caption); text-transform: uppercase; letter-spacing: 0.06em; }
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border-radius: var(--radius-tags);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--status-${(p) => p.$tone}-fg);
  background: var(--status-${(p) => p.$tone}-bg);
`;

const Attention = styled.p`
  padding: 0.8rem 1.2rem;
  border-radius: var(--radius-inputs);
  background: var(--status-unconfirmed-bg);
  color: var(--status-unconfirmed-fg);
  font-size: var(--text-body) !important;
  font-weight: 600;
`;

const Warn = styled.p`
  padding: 0.8rem 1.2rem;
  border-radius: var(--radius-inputs);
  background: var(--status-unconfirmed-bg);
  color: var(--status-unconfirmed-fg);
  font-size: 1.3rem;
`;

const Note = styled.p`
  font-size: var(--text-caption);
  color: var(--color-grey-500);
`;

const EXAMPLES = [
  "Who checks in tomorrow?",
  "Who checks out today?",
  "Which arrivals this week are unpaid?",
  "What is occupancy for the next 7 days?",
  "Which cabin earned the most this month?",
];

const HEAD = {
  id: "Booking", guest: "Guest", cabin: "Cabin", startDate: "Check-in", endDate: "Check-out", nights: "Nights",
  status: "Status", isPaid: "Paid", total: "Total", task: "Task", date: "Date", occupiedCabins: "Cabins used",
  occupancyPct: "Occupancy %", revenue: "Revenue", bookings: "Bookings",
};
const HIDE = new Set(["guestEmail", "cabinId", "tool"]);

function SourceTable({ rows }) {
  const cols = Object.keys(rows[0]).filter((k) => !HIDE.has(k));
  const fmt = (k, v) => {
    if (k === "isPaid") return <Badge $tone={v ? "ok" : "unconfirmed"}>{v ? "Paid" : "Unpaid"}</Badge>;
    if (k === "status") {
      const tone = { unconfirmed: "unconfirmed", "checked-in": "inhouse", "checked-out": "out", cancelled: "alert" }[v] || "out";
      return <Badge $tone={tone}>{STATUS_META[v]?.label || v}</Badge>;
    }
    if (k === "startDate" || k === "endDate" || k === "date") return fmtUTC(v, { weekday: "short", day: "numeric", month: "short" });
    if (k === "total" || k === "revenue") return formatCurrency(v);
    if (k === "occupancyPct") return `${v}%`;
    return String(v ?? "");
  };
  return (
    <Scroll>
      <table className="stack">
        <thead><tr>{cols.map((c) => <th key={c}>{HEAD[c] || c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i}>
              {cols.map((c) => (
                <td key={c} data-label={HEAD[c] || c}>
                  {c === "id" ? <Link href={`/bookings/${r.id}`}>#{String(r.id).slice(-6).toUpperCase()}</Link> : c === "guest" ? <strong>{r[c]}</strong> : fmt(c, r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Scroll>
  );
}

// Jawaban AI hanya berisi teks biasa, "- " untuk poin, dan **tebal**. Dirender sebagai elemen React
// (bukan HTML mentah), jadi tidak ada risiko injeksi.
function Inline({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

function AnswerText({ text }) {
  const blocks = [];
  let list = null;
  String(text || "").split("\n").map((l) => l.trim()).filter(Boolean).forEach((line) => {
    if (/^[-•*]\s+/.test(line)) {
      if (!list) { list = []; blocks.push({ type: "ul", items: list }); }
      list.push(line.replace(/^[-•*]\s+/, ""));
    } else {
      list = null;
      blocks.push({ type: /^(needs attention|perlu perhatian)\s*:/i.test(line) ? "attn" : "p", text: line });
    }
  });
  return blocks.map((b, i) =>
    b.type === "ul" ? <ul key={i}>{b.items.map((t, n) => <li key={n}><Inline text={t} /></li>)}</ul>
    : b.type === "attn" ? <Attention key={i}><Inline text={b.text} /></Attention>
    : <p key={i}><Inline text={b.text} /></p>
  );
}

function Ask({ enabled }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  // Datang dari Ctrl+K: isi pertanyaan, staf yang menekan Ask.
  useEffect(() => {
    const pre = new URLSearchParams(window.location.search).get("q");
    if (pre) setQ(pre.slice(0, 500));
  }, []);
  const { mutate, isPending, error, variables } = useMutation({
    mutationFn: (question) => askAi(question, todayKey()),
    onSuccess: (res, question) => setItems((l) => [{ question, ...res }, ...l]),
  });
  function submit(text) {
    const question = (text ?? q).trim();
    if (question.length < 2 || isPending) return;
    mutate(question);
    setQ("");
  }
  return (
    <Panel>
      {!enabled && <Note>The assistant is not available right now. Please ask an admin to turn it on.</Note>}
      <Note>Each question is answered on its own, so include the day or cabin you mean. You can ask in English or Indonesian.</Note>
      <AskRow onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Input value={q} maxLength={500} placeholder="Ask about bookings, arrivals, occupancy…" aria-label="Question" onChange={(e) => setQ(e.target.value)} disabled={!enabled} />
        <Button variation="accent" disabled={!enabled || isPending}>{isPending ? <SpinnerMini /> : "Ask"}</Button>
      </AskRow>
      <Chips>
        {EXAMPLES.map((e) => (
          <button key={e} type="button" disabled={!enabled || isPending} onClick={() => submit(e)}>{e}</button>
        ))}
      </Chips>
      {error && <p role="alert" style={{ color: "var(--status-alert-fg)" }}>{error.message}</p>}
      {isPending && (
        <Answer role="status" aria-busy="true" className="enter">
          <h3>{variables}</h3>
          <p style={{ color: "var(--color-grey-500)" }}>Checking your data…</p>
        </Answer>
      )}
      {items.map((it, i) => (
        <Answer key={i} className="enter">
          <h3>{it.question}</h3>
          <AnswerText text={it.answer} />
          {!it.checked && (
            <Warn role="alert">No data was checked for this answer. Do not rely on it. Try asking in a different way.</Warn>
          )}
          {it.sources.map((s, n) => (s.rows.length ? <SourceTable key={n} rows={s.rows} /> : null))}
          <small>Read-only. The table above is the data behind the answer. For anything important, confirm it on the Bookings page.</small>
        </Answer>
      ))}
    </Panel>
  );
}

function Report() {
  const { data, isPending, error } = useQuery({ queryKey: ["ai-report", todayKey()], queryFn: () => getWeeklyReport(todayKey()), staleTime: 5 * 60_000 });
  if (isPending) return <Note>Preparing the weekly report…</Note>;
  if (error) return <p role="alert" style={{ color: "var(--status-alert-fg)" }}>{error.message}</p>;
  const f = data.figures;
  return (
    <Panel>
      <Answer>
        <h3>Week {f.period}</h3>
        <p>{data.narrative}</p>
        <Scroll>
          <table>
            <tbody>
              <tr><th>Occupancy</th><td>{f.occupancyPct}% (previous week {f.occupancyPrevPct}%)</td></tr>
              <tr><th>Revenue</th><td>{formatCurrency(f.revenue)} (previous week {formatCurrency(f.revenuePrev)})</td></tr>
              <tr><th>New bookings</th><td>{f.newBookings}</td></tr>
              <tr><th>Cancellations</th><td>{f.cancellations}</td></tr>
              <tr><th>Late check-outs</th><td>{f.lateCheckOuts}</td></tr>
              <tr><th>Unpaid arrivals</th><td>{f.unpaidArrivals}</td></tr>
            </tbody>
          </table>
        </Scroll>
        <small>Numbers are calculated from your data{data.usedAi ? "; the AI only wrote the summary." : ". The summary uses a fixed template because AI is off."}</small>
      </Answer>
    </Panel>
  );
}

function Prices() {
  const { data, isPending, error } = useQuery({ queryKey: ["ai-prices", todayKey()], queryFn: () => getPriceSuggestions(todayKey()), staleTime: 5 * 60_000 });
  if (isPending) return <Note>Working out price suggestions…</Note>;
  if (error) return <p role="alert" style={{ color: "var(--status-alert-fg)" }}>{error.message}</p>;
  return (
    <Panel>
      <Note>{data.note} To apply a price, edit the cabin on the Cabins page.</Note>
      <Answer>
        <Scroll>
          <table>
            <thead><tr><th>Cabin</th><th>Now</th><th>Suggested</th><th>Change</th><th>Next 30 days</th><th>Why</th></tr></thead>
            <tbody>
              {data.suggestions.map((s) => (
                <tr key={s.cabinId}>
                  <td>{s.cabin}</td>
                  <td>{formatCurrency(s.currentPrice)}</td>
                  <td>{formatCurrency(s.suggestedPrice)}</td>
                  <td>{s.changePct > 0 ? "+" : ""}{s.changePct}%</td>
                  <td>{s.occupancyNext30}% booked</td>
                  <td style={{ whiteSpace: "normal", minWidth: "22rem" }}>{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroll>
        <small>Suggestions never change more than 15% and are never applied automatically.</small>
      </Answer>
    </Panel>
  );
}

function Assistant() {
  const [tab, setTab] = useState("ask");
  const { isAdmin } = useUser();
  const { data: status } = useQuery({ queryKey: ["ai-status"], queryFn: getAiStatus });
  const tabs = [["ask", "Ask"], ...(isAdmin ? [["report", "Weekly report"], ["prices", "Price suggestions"]] : [])];
  return (
    <>
      <Tabs role="tablist" aria-label="Assistant sections">
        {tabs.map(([k, l]) => (
          <button type="button" key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </Tabs>
      {tab === "ask" && <Ask enabled={!!status?.enabled} />}
      {tab === "report" && isAdmin && <Report />}
      {tab === "prices" && isAdmin && <Prices />}
    </>
  );
}

export default Assistant;
