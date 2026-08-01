import { Suspense } from "react";
import { MemberProfileRoute } from "@/components/member-profile-route";

export default function Page() {
  return (
    <Suspense fallback={<main>読み込み中…</main>}>
      <MemberProfileRoute />
    </Suspense>
  );
}
