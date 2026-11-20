"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateBooking } from "../../services/apiBookings";

function useCancelBooking() {
  const queryClient = useQueryClient();
  const { isPending, mutate: cancelBooking } = useMutation({
    mutationFn: (id) => updateBooking(id, { status: "cancelled" }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries();
    },
    onError: (err) => toast.error(err.message),
  });
  return { isPending, cancelBooking };
}

export default useCancelBooking;
