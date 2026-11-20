"use client";

/* eslint-disable react/prop-types */
import useUser from "../features/authentication/useUser";
import { FormSkeleton } from "./Skeleton";

// Halaman khusus admin. Server tetap menolak API-nya; ini hanya agar staf tidak melihat halaman kosong.
function AdminOnly({ children }) {
  const { isPending, isAdmin } = useUser();
  if (isPending) return <FormSkeleton fields={3} />;
  if (!isAdmin) {
    return (
      <div
        style={{
          padding: "4.8rem 2.4rem",
          textAlign: "center",
          border: "1px dashed var(--color-grey-300)",
          borderRadius: "var(--radius-cards)",
          color: "var(--color-grey-500)",
        }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-heading)", color: "var(--color-grey-700)" }}>
          Admins only
        </h3>
        <p>Ask an admin if you need access to this page.</p>
      </div>
    );
  }
  return children;
}

export default AdminOnly;
