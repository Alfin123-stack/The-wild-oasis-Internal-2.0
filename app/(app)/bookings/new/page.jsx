import PageHeader from "@/ui/PageHeader";
import NewBookingForm from "@/features/bookings/NewBookingForm";

export const metadata = { title: "New booking" };

export default function Page() {
  return (
    <>
      <PageHeader title="New booking" subtitle="For walk-in guests or phone reservations. Prices are calculated for you." />
      <NewBookingForm />
    </>
  );
}
