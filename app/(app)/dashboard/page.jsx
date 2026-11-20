import DashboardFilter from "@/features/dashboard/DashboardFilter";
import DashboardLayout from "@/features/dashboard/DashboardLayout";
import PageHeader from "@/ui/PageHeader";

export const metadata = { title: "Dashboard" };

export default function Page() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Performance, today's arrivals and what needs action.">
        <DashboardFilter />
      </PageHeader>
      <DashboardLayout />
    </>
  );
}
