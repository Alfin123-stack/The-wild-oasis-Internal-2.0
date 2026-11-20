"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import Table from "../../ui/Table";
import Empty from "../../ui/Empty";
import Input from "../../ui/Input";
import { RowsSkeleton } from "../../ui/Skeleton";
import { getActivity } from "../../services/apiExtra";
import useUsers from "../authentication/useUsers";

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin: 2rem 0;
  & select, & input { min-height: var(--control-h); border: 1px solid var(--color-grey-300); border-radius: var(--radius-buttons); padding: 0 1.2rem; background: var(--color-grey-0); color: var(--color-grey-800); }
`;
const Act = styled.code`
  font-size: 1.2rem;
  color: var(--color-bronze-strong);
`;

const GROUPS = [
  ["", "All actions"],
  ["booking", "Bookings"],
  ["cabin", "Cabins"],
  ["guest", "Guests"],
  ["user", "Users"],
  ["settings", "Settings"],
  ["ai", "Assistant"],
];

function ActivityLog() {
  const [user, setUser] = useState("");
  const [action, setAction] = useState("");
  const [date, setDate] = useState("");
  const { users } = useUsers();
  const { data, isPending, error } = useQuery({
    queryKey: ["activity", user, action, date],
    queryFn: () => getActivity({ user, action, date }),
  });

  return (
    <>
      <Filters>
        <select aria-label="User" value={user} onChange={(e) => setUser(e.target.value)}>
          <option value="">All users</option>
          {(users || []).map((u) => (
            <option key={u.id} value={u.id}>{u.fullName}</option>
          ))}
        </select>
        <select aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)}>
          {GROUPS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Input type="date" aria-label="Date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "auto" }} />
      </Filters>
      {isPending ? (
        <RowsSkeleton rows={6} />
      ) : error ? (
        <p style={{ color: "var(--status-alert-fg)" }}>Failed to load activity: {error.message}</p>
      ) : data.length === 0 ? (
        <Empty resource="activity" />
      ) : (
        <Table columns="1.2fr 1.2fr 2.4fr 1.2fr">
          <Table.Header>
            <div>Who</div>
            <div>Action</div>
            <div>Details</div>
            <div>When</div>
          </Table.Header>
          <Table.Body
            data={data}
            render={(a) => (
              <Table.Row key={a.id} areas={'"who when" "act act" "sum sum"'}>
                <b data-area="who" style={{ fontWeight: 600 }}>{a.userName || "—"}</b>
                <Act data-area="act">{a.action}</Act>
                <span data-area="sum" style={{ fontSize: "1.3rem", color: "var(--color-grey-600)" }}>{a.summary}</span>
                <span data-area="when" data-end style={{ fontSize: "1.3rem", color: "var(--color-grey-500)" }}>
                  {new Date(a.createdAt).toLocaleString("en", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
              </Table.Row>
            )}
          />
        </Table>
      )}
    </>
  );
}

export default ActivityLog;
