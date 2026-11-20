import PageHeader from "@/ui/PageHeader";
import ViewSwitch from "@/features/bookings/ViewSwitch";
import BookingTimeline from "@/features/bookings/BookingTimeline";

export const metadata = { title: "Timeline" };

export default function Page() {
  return (
    <>
      <PageHeader title="Timeline" subtitle="Every cabin, day by day. Click a bar for quick actions.">
        <ViewSwitch current="timeline" />
      </PageHeader>
      <BookingTimeline />
    </>
  );
}
