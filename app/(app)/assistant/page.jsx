import PageHeader from "@/ui/PageHeader";
import Assistant from "@/features/assistant/Assistant";

export const metadata = { title: "Assistant" };

export default function Page() {
  return (
    <>
      <PageHeader title="Assistant" subtitle="Ask about bookings in plain words. It can only read data, and shows the rows behind each answer." />
      <Assistant />
    </>
  );
}
