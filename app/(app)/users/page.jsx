import PageHeader from "@/ui/PageHeader";
import AdminOnly from "@/ui/AdminOnly";
import UserList from "@/features/authentication/UserList";
import AddUser from "@/features/authentication/AddUser";

export const metadata = { title: "Users" };

export default function Page() {
  return (
    <>
      <PageHeader title="Users" subtitle="Staff who can sign in to this dashboard.">
        <AddUser />
      </PageHeader>
      <AdminOnly>
        <UserList />
      </AdminOnly>
    </>
  );
}
