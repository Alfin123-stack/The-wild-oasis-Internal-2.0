import UpdateSettingsForm from "@/features/settings/UpdateSettingsForm";
import PageHeader from "@/ui/PageHeader";
import AdminOnly from "@/ui/AdminOnly";

export const metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Booking rules and pricing for the whole property." />
      <AdminOnly>
        <UpdateSettingsForm />
      </AdminOnly>
    </>
  );
}
