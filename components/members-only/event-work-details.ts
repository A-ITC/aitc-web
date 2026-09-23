"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchMembersOnlyEventWork,
  MembersOnlyApiError,
} from "@/lib/members-only-api";
import { PromiseQueue } from "@/lib/promise-queue";
import type { EventWork } from "../data";

export type EventWorkDetailState = {
  status: "queued" | "loading" | "ready" | "error";
  work?: EventWork;
};

export function useEventWorkDetails({
  accessToken,
  invalidateAuthentication,
}: {
  accessToken: string;
  invalidateAuthentication: () => void;
}) {
  const [states, setStates] = useState<
    Record<string, EventWorkDetailState>
  >({});
  const queue = useMemo(
    () =>
      new PromiseQueue<string, EventWork>(
        2,
        (id, state) => {
          setStates((current) => ({
            ...current,
            [id]: {
              status: state.status,
              work: state.status === "ready" ? state.value : undefined,
            },
          }));
        },
      ),
    [accessToken, invalidateAuthentication],
  );

  useEffect(() => () => queue.dispose(), [queue]);

  const load = useCallback(
    (id: string, priority = false) =>
      queue.request(
        id,
        async (signal) => {
          try {
            return await fetchMembersOnlyEventWork(id, accessToken, signal);
          } catch (error) {
            if (
              error instanceof MembersOnlyApiError &&
              (error.status === 401 || error.status === 403)
            ) {
              invalidateAuthentication();
            }
            throw error;
          }
        },
        priority,
      ),
    [accessToken, invalidateAuthentication, queue],
  );

  return { states, load };
}
