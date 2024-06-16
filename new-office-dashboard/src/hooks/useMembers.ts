import { useQuery } from "@tanstack/react-query";
import { MEMBERS_URL } from "app/config";

// TODO: HA EN FUNKSJON SOM FJERNER NØKLER OG MACs
export type Member = {
  name: string;
  full_name: string;
  birthday: string;
  joined: string;
  first_lego_commit: string;
  avatar: string;
  slack: string;
  phone_number: string;
  github: string;
  duolingo: string;
  brus: string;
  active: string;
  new: string;
};

const fetchMembers = async () => {
  const res = await fetch(MEMBERS_URL, {});

  if (!res.ok) {
    throw new Error("Fetching of members failed");
  }

  const data = (await res.json()) as Member;
  return data;
};

function useMembers() {
  const queryResult = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
    retry: 1,
  });
  return queryResult;
}

export { useMembers };
