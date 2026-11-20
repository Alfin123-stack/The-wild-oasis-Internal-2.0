"use client";

import BookingRow from "./BookingRow";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import useBookings from "./useBookings";
import { RowsSkeleton } from "../../ui/Skeleton";
import Pagination from "../../ui/Pagination";

function BookingTable() {
  const { isLoading, bookings, count, error, isPlaceholderData } = useBookings();

  if (isLoading) return <RowsSkeleton rows={8} />;
  if (error) return <p style={{ color: "var(--status-alert-fg)" }}>Failed to load bookings: {error.message}</p>;

  return (
    <Menus>
      <div aria-busy={isPlaceholderData} style={{ opacity: isPlaceholderData ? 0.55 : 1, transition: "opacity var(--dur-fast)" }}>
      <Table columns="2fr 0.7fr 1.8fr 1.2fr 1.1fr auto">
        <Table.Header>
          <div>Guest</div>
          <div>Cabin</div>
          <div>Stay</div>
          <div>Status</div>
          <div>Total</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={bookings || []}
          render={(booking) => <BookingRow key={booking.id} booking={booking} />}
        />
        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
      </div>
    </Menus>
  );
}

export default BookingTable;
