"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout as logoutApi } from "../../services/apiAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isPending, mutate: logout } = useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      queryClient.removeQueries();
      toast.success("You have been signed out");
      router.replace("/login");
      router.refresh();
    },
    onError: () => {
      toast.error("Cannot log out");
    },
  });

  return { isPending, logout };
}

export default useLogout;
