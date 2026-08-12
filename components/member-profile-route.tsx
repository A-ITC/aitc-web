"use client";

import { useSearchParams } from "next/navigation";
import { MemberPage } from "./site";

export function MemberProfileRoute() {
  const searchParams = useSearchParams();
  return <MemberPage id={searchParams.get("id") ?? ""} />;
}
