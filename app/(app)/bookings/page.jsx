import PageHeader from "@/ui/PageHeader";
import BookingTable from "@/features/bookings/BookingTable";
import BookingTableOperations from "@/features/bookings/BookingTableOperations";

export const metadata = { title: "Bookings" };

export default function Page() {
  return (
    <>
      <PageHeader title="Bookings" subtitle="All reservations. Search a guest from the top bar.">
        <BookingTableOperations />
      </PageHeader>
      <BookingTable />
    </>
  );
}
