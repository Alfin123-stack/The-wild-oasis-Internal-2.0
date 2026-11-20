"use client";

import { useState } from "react";
import styled from "styled-components";
import Card from "../../ui/Card";
import Tabs from "../../ui/Tabs";
import { ListSkeleton } from "../../ui/Skeleton";
import TodayItem from "./TodayItem";
import MiniCalendar from "../dashboard/MiniCalendar";
import { useTodayActivity } from "./useTodayActivity";
import { useTimeline } from "../bookings/useTimeline";
import { keyToDate, todayKey } from "../../utils/dates";

const List = styled.ul`
  max-height: 34rem;
  overflow-y: auto;
`;

const None = styled.p`
  text-align: center;
  font-size: 1.3rem;
  color: var(--color-grey-500);
  padding: 2.4rem 0;
`;

const Rule = styled.hr`
  border: none;
  border-top: 1px solid var(--color-grey-200);
`;

function TodayActivity() {
  const [tab, setTab] = useState("arrivals");
  const { isPending, activities } = useTodayActivity();
  const today = keyToDate(todayKey());
  const { bookings: windowBookings, isPending: isPendingWindow } = useTimeline(today, today);

  const arrivals = (activities || []).filter((a) => a.status === "unconfirmed");
  const departures = (activities || []).filter((a) => a.status === "checked-in");
  const inhouse = (windowBookings || []).filter((b) => b.status === "checked-in");

  const lists = { arrivals, inhouse, departures };
  const current = lists[tab];
  const loading = isPending || isPendingWindow;

  return (
    <Card title="Today" hint="Arrivals, in-house and departures">
      <MiniCalendar />
      <Rule />
      <Tabs
        label="Today's activity"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "arrivals", label: `Arrivals (${arrivals.length})` },
          { value: "inhouse", label: `In-house (${inhouse.length})` },
          { value: "departures", label: `Departures (${departures.length})` },
        ]}
      />
      {loading ? (
        <ListSkeleton rows={4} />
      ) : current.length ? (
        <List>
          {current.map((a) => (
            <TodayItem key={a.id} activity={a} mode={tab} />
          ))}
        </List>
      ) : (
        <None>No {tab === "inhouse" ? "in-house guests" : tab} today.</None>
      )}
    </Card>
  );
}

export default TodayActivity;
