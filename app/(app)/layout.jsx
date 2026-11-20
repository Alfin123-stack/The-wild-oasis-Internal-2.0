import AppLayout from "@/ui/AppLayout";

// Halaman di dalam grup ini butuh login (dijaga middleware.js) dan bersifat dinamis.
export const dynamic = "force-dynamic";

export default function AppGroupLayout({ children }) {
  return <AppLayout>{children}</AppLayout>;
}
