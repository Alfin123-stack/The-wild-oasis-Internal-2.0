"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../services/apiAuth";

function useUsers() {
  const { isPending, data: users, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  return { isPending, users, error };
}

export default useUsers;
