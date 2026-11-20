"use client";

import { createElement } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteBooking as deleteBookingApi } from "../../services/apiBookings";
import { restoreBooking } from "../../services/apiExtra";

// Hapus = pindah ke tempat sampah (soft delete). Toast "Undo" memulihkannya selama 8 detik.
function useDeleteBooking() {
  const queryClient = useQueryClient();
  const { isPending, mutate: deleteBooking } = useMutation({
    mutationFn: (id) => deleteBookingApi(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(); // dashboard, timeline, today ikut berubah
      toast(
        (t) =>
          createElement(
            "span",
            { style: { display: "inline-flex", gap: "1.2rem", alignItems: "center" } },
            "Booking deleted.",
            createElement(
              "button",
              {
                style: { fontWeight: 600, textDecoration: "underline", background: "none", color: "inherit", minHeight: "var(--control-h-sm)" },
                onClick: async () => {
                  toast.dismiss(t.id);
                  try {
                    await restoreBooking(res.id);
                    queryClient.invalidateQueries();
                    toast.success("Booking restored");
                  } catch (err) {
                    toast.error(err.message);
                  }
                },
              },
              "Undo"
            )
          ),
        { duration: 8000 }
      );
    },
    onError: (err) => toast.error(err.message),
  });

  return { isPending, deleteBooking };
}

export default useDeleteBooking;
