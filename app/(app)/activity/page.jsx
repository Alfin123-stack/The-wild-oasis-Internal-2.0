import PageHeader from "@/ui/PageHeader";
import AdminOnly from "@/ui/AdminOnly";
import ActivityLog from "@/features/activity/ActivityLog";

export const metadata = { title: "Activity" };

export default function Page() {
  return (
    <>
      <PageHeader title="Activity" subtitle="Who did what, and when. Only admins can see this page." />
      <AdminOnly>
        <ActivityLog />
      </AdminOnly>
    </>
  );
}
