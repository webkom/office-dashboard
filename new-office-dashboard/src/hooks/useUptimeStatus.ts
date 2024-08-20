import { useQuery } from "@tanstack/react-query";
import { UPTIME_ROBOT_POST_DATA, UPTIME_ROBOT_URL } from "app/config";

export type UptimeResponse = {
  stat: "ok" | string;
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
  monitors: [
    {
      id: number;
      friendly_name: string;
      url: string;
      type: number;
      sub_type?: number;
      keyword_type?: number;
      keyword_case_type?: number;
      keyword_value: string;
      port: number;
      interval: number;
      timeout: number;
      status: number;
      create_datetime: number;
    },
  ];
};

const fetchUptimeStatus = async () => {
  const res = await fetch(UPTIME_ROBOT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(UPTIME_ROBOT_POST_DATA),
  });

  if (!res.ok) {
    throw new Error("Fetching of uptime status failed");
  }

  const data = (await res.json()) as UptimeResponse;
  return data;
};

function useUptimeStatus() {
  const queryResult = useQuery({
    queryKey: ["uptime-status"],
    queryFn: fetchUptimeStatus,
    retry: 1,
    refetchInterval: 1000 * 30,
  });
  return queryResult;
}

export { useUptimeStatus };
