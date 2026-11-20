"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCabin as deleteCabinApi } from "../../services/apiCabins";
import toast from "react-hot-toast";

function useDeleteCabin(){
    const queryClient = useQueryClient();
  const { isPending, mutate: deleteCabin } = useMutation({
    mutationFn: (id) => deleteCabinApi(id),
    onSuccess: () => {
      toast.success("Cabin deleted");
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] }); // nama cabin di tabel booking
    },
    onError: (err) => toast.error(err.message),
  });

  return {isPending, deleteCabin}
}

export default useDeleteCabin;