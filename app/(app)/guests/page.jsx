import PageHeader from "@/ui/PageHeader";
import GuestList from "@/features/guests/GuestList";

export const metadata = { title: "Guests" };

export default function Page() {
  return (
    <>
      <PageHeader title="Guests" subtitle="Everyone who has booked. Search by name or email, or fix contact details." />
      <GuestList />
    </>
  );
}
