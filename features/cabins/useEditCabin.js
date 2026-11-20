"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEditCabin } from "../../services/apiCabins";
import toast from "react-hot-toast";

function useEditCabin(){
    const queryClient = useQueryClient();
    const { mutate: editCabin, isPending: isEditing } = useMutation({
        mutationFn: ({newCabin,id}) => addEditCabin(newCabin, id),
        onSuccess: () => {
          toast.success("Cabin updated");
          queryClient.invalidateQueries({ queryKey: ["cabins"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] }); // nama cabin di tabel booking
        //   reset();
        },
        onError: (err) => toast.error(err.message),
      });

      return { editCabin, isEditing };
}

export default useEditCabin;