"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../services/apiAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isPending, mutate: login } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Welcome back!");
      router.replace("/dashboard");
      router.refresh(); // supaya cookie sesi baru terbaca oleh server
    },
    onError: () => {
      toast.error("Email or password is incorrect");
    },
  });

  return { isPending, login };
}

export default useLogin;
