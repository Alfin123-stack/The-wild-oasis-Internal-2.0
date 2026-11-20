"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEditCabin } from "../../services/apiCabins";
import toast from "react-hot-toast";

function useCreateCabin(){
    const queryClient = useQueryClient();

  const { mutate: addCabin, isPending: isAdding } = useMutation({
    mutationFn: (newCabin) => addEditCabin(newCabin),
    onSuccess: () => {
      toast.success("Cabin added");
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] }); // nama cabin di tabel booking
    //   reset();
    },
    onError: (err) => toast.error(err.message),
  });

  return { addCabin, isAdding };    
}
export default useCreateCabin