import CabinTable from "@/features/cabins/CabinTable";
import PageHeader from "@/ui/PageHeader";
import AddCabin from "@/features/cabins/AddCabin";
import CabinTableOperations from "@/features/cabins/CabinTableOperations";

export const metadata = { title: "Cabins" };

export default function Page() {
  return (
    <>
      <PageHeader title="Cabins" subtitle="The property at a glance, with today's status for every cabin.">
        <CabinTableOperations />
        <AddCabin />
      </PageHeader>
      <CabinTable />
    </>
  );
}
