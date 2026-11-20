"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { setCabinArchived } from "../../services/apiCabins";

function useArchiveCabin() {
  const queryClient = useQueryClient();
  const { mutate: archiveCabin, isPending: isArchiving } = useMutation({
    mutationFn: ({ id, archived }) => setCabinArchived(id, archived),
    onSuccess: (_d, { archived }) => {
      toast.success(archived ? "Cabin archived" : "Cabin restored");
      queryClient.invalidateQueries();
    },
    onError: (err) => toast.error(err.message),
  });
  return { archiveCabin, isArchiving };
}

export default useArchiveCabin;
