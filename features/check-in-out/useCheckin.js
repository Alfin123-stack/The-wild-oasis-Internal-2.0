"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../../services/apiBookings";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function useCheckin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate: updateCheckin, isPending: isCheckin } = useMutation({
    mutationFn: ({ bookingId, breakfast }) =>
      updateBooking(bookingId, {
        status: "checked-in",
        isPaid: true,
        ...breakfast,
      }),
    onSuccess: (data) => {
      toast.success(`Booking #${String(data.id).slice(-6).toUpperCase()} checked in`);
      queryClient.invalidateQueries();
      router.push("/dashboard");
      //   reset();
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateCheckin, isCheckin };
}

export default useCheckin;
