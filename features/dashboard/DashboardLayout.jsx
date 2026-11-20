"use client";

import styled from "styled-components";
import { useRecentBookings } from "./useRecentBookings";
import { useRecentStays } from "./useRecentStays";
import { SkeletonRegion, StatCardSkeleton, PanelSkeleton } from "../../ui/Skeleton";
import Stats from "./Stats";
import useCabins from "../cabins/useCabins";
import SalesChart from "./SalesChart";
import DurationChart from "./DurationChart";
import UpcomingArrivals from "./UpcomingArrivals";
import TodayActivity from "../check-in-out/TodayActivity";
import InsightCards from "../insights/InsightCards";
import { media } from "../../styles/breakpoints";

const Grid = styled.div.attrs({ className: "enter-list" })`
  display: grid;
  /* 1 kolom di HP sempit, 2 di HP lebar/tablet, 4 di desktop: tanpa breakpoint manual */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: clamp(1.2rem, 0.8rem + 1vw, 2rem);
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36rem;
  gap: clamp(1.2rem, 0.8rem + 1vw, 2rem);
  align-items: start;

  ${media.down.large} { grid-template-columns: minmax(0, 1fr); }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(1.2rem, 0.8rem + 1vw, 2rem);
  min-width: 0;
`;

function DashboardSkeleton() {
  return (
    <SkeletonRegion label="Loading dashboard…" style={{ display: "contents" }}>
      <Grid>
        {[0, 1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </Grid>
      <Columns>
        <Stack>
          <PanelSkeleton height="32rem" />
          <PanelSkeleton lines={3} />
        </Stack>
        <PanelSkeleton lines={4} />
      </Columns>
    </SkeletonRegion>
  );
}

function DashboardLayout() {
  const { isPending: isPendingBooking, recentBookings, previousBookings } = useRecentBookings();
  const { isPending: isPendingStay, getDate, confirmedStay, previousConfirmed } = useRecentStays();
  const { isLoading, count: cabinCount } = useCabins({ all: true });

  if (isPendingBooking || isPendingStay || isLoading) return <DashboardSkeleton />;

  if (!recentBookings || !confirmedStay) {
    return (
      <p style={{ fontSize: "var(--text-body)", color: "var(--color-grey-500)" }}>
        Failed to load dashboard data. Check the server log for details.
      </p>
    );
  }

  return (
    <>
      <InsightCards />
      <Grid>
        <Stats
          bookings={recentBookings}
          previousBookings={previousBookings}
          confirmedStays={confirmedStay}
          previousConfirmed={previousConfirmed}
          countCabins={cabinCount}
          numDays={getDate}
        />
      </Grid>
      <Columns>
        <Stack>
          <SalesChart bookings={recentBookings} previousBookings={previousBookings} numDays={getDate} />
          <UpcomingArrivals />
          <DurationChart confirmedStays={confirmedStay} />
        </Stack>
        <TodayActivity />
      </Columns>
    </>
  );
}

export default DashboardLayout;
