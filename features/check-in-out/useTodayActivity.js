"use client";

import { useQuery } from "@tanstack/react-query";
import { getStaysTodayActivity } from "../../services/apiBookings";
import { todayKey } from "../../utils/dates";

export function useTodayActivity() {
  const date = todayKey();
  const { isPending, data: activities } = useQuery({
    queryKey: ["today-activities", date],
    queryFn: () => getStaysTodayActivity(date),
  });

  return { isPending, activities };
}
