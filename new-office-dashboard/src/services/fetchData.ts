import { QueryFunction, useQuery } from "@tanstack/react-query";

import { PRESENCE_URL, BRUS_URL, KAFFE_URL } from "app/config";

const defaultFetches = {
  presenceFetch: {
    method: "GET",
    mode: "cors",
    url: PRESENCE_URL,
    refreshInterval: 60000,
  },
  brusFetch: {
    method: "GET",
    mode: "cors",
    url: `${BRUS_URL}/api/liste/`,
    refreshInterval: 60000,
  },
  kaffeFetch: {
    method: "GET",
    mode: "cors",
    url: KAFFE_URL,
    refreshInterval: 60000,
  },
};

export const presenceFetch: QueryFunction = async () => {
  return await fetch(PRESENCE_URL);
  //TODO: Fix error handling?
};
