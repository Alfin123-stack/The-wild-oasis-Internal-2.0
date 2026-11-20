import PageHeader from "@/ui/PageHeader";
import AccountTabs from "@/features/authentication/AccountTabs";

export const metadata = { title: "Account" };

export default function Page() {
  return (
    <>
      <PageHeader title="Account" subtitle="Your profile and sign-in security." />
      <AccountTabs />
    </>
  );
}
