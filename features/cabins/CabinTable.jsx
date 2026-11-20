"use client";

import styled from "styled-components";
import { useSearchParams } from "next/navigation";
import { CardGridSkeleton, RowsSkeleton } from "../../ui/Skeleton";
import Empty from "../../ui/Empty";
import CabinRow from "./CabinRow";
import CabinCard from "./CabinCard";
import useCabins from "./useCabins";
import { useCabinStatus } from "./useCabinStatus";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Pagination from "../../ui/Pagination";

const Grid = styled.div.attrs({ className: "enter-list" })`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 28rem), 1fr));
  gap: clamp(1.2rem, 0.8rem + 1.2vw, 2.4rem);
`;

// grid (default): semua cabin, filter/sort di server. table: dengan paginasi.
function CabinTable() {
  const view = useSearchParams().get("view") === "table" ? "table" : "grid";
  const { isLoading, error, cabins, count } = useCabins({ unpaged: view === "grid" });
  const { statusOf } = useCabinStatus();

  if (isLoading) return view === "grid" ? <CardGridSkeleton /> : <RowsSkeleton rows={6} />;
  if (error) return <p style={{ color: "var(--status-alert-fg)" }}>Error: {error.message}</p>;
  if (!cabins?.length) return <Empty resource="cabins" />;

  if (view === "grid") {
    return (
      <Menus>
        <Grid>
          {cabins.map((cabin) => (
            <CabinCard key={cabin.id} cabin={cabin} status={statusOf(cabin.id)} />
          ))}
        </Grid>
      </Menus>
    );
  }

  return (
    <Menus>
      <Table columns="8.4rem 1fr 1.6fr 1.4fr 1fr 1fr auto">
        <Table.Header>
          <div></div>
          <div>Cabin</div>
          <div>Capacity</div>
          <div>Today</div>
          <div>Price</div>
          <div>Discount</div>
          <div></div>
        </Table.Header>
        <Table.Body
          data={cabins}
          render={(cabin) => <CabinRow key={cabin.id} cabin={cabin} status={statusOf(cabin.id)} />}
        />
        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default CabinTable;
