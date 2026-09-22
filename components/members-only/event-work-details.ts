"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchMembersOnlyEventWork,
  MembersOnlyApiError,
} from "@/lib/members-only-api";
import type { EventWork } from "../data";

export type EventWorkDetailState = {
  status: "queued" | "loading" | "ready" | "error";
  work?: EventWork;
};

type QueueTask = {
  id: string;
  promise: Promise<EventWork>;
  resolve: (work: EventWork) => void;
  reject: (error: unknown) => void;
  controller?: AbortController;
};

class EventWorkDetailQueue {
  private readonly cache = new Map<string, EventWork>();
  private readonly pending = new Map<string, QueueTask>();
  private readonly queue: QueueTask[] = [];
  private activeCount = 0;
  private disposed = false;

  constructor(
    private readonly fetchWork: (
      id: string,
      signal: AbortSignal,
    ) => Promise<EventWork>,
    private readonly onStateChange: (
      id: string,
      state: EventWorkDetailState,
    ) => void,
    private readonly concurrency: number,
  ) {}

  request(id: string, priority = false): Promise<EventWork> {
    const cached = this.cache.get(id);
    if (cached) return Promise.resolve(cached);

    const existing = this.pending.get(id);
    if (existing) {
      if (priority && !existing.controller) this.promote(existing);
      return existing.promise;
    }

    if (this.disposed) {
      return Promise.reject(new DOMException("Aborted", "AbortError"));
    }

    let resolve!: (work: EventWork) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<EventWork>((nextResolve, nextReject) => {
      resolve = nextResolve;
      reject = nextReject;
    });
    const task = { id, promise, resolve, reject };
    this.pending.set(id, task);
    if (priority) this.queue.unshift(task);
    else this.queue.push(task);
    this.onStateChange(id, { status: "queued" });
    this.pump();
    return promise;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const abortError = new DOMException("Aborted", "AbortError");
    this.queue.splice(0).forEach((task) => {
      this.pending.delete(task.id);
      task.reject(abortError);
    });
    this.pending.forEach((task) => task.controller?.abort());
    this.cache.clear();
  }

  private promote(task: QueueTask) {
    const index = this.queue.indexOf(task);
    if (index <= 0) return;
    this.queue.splice(index, 1);
    this.queue.unshift(task);
  }

  private pump() {
    while (
      !this.disposed &&
      this.activeCount < this.concurrency &&
      this.queue.length > 0
    ) {
      const task = this.queue.shift();
      if (!task) return;
      this.start(task);
    }
  }

  private start(task: QueueTask) {
    const controller = new AbortController();
    task.controller = controller;
    this.activeCount += 1;
    this.onStateChange(task.id, { status: "loading" });

    void this.fetchWork(task.id, controller.signal)
      .then((work) => {
        if (!this.disposed) {
          this.cache.set(task.id, work);
          this.onStateChange(task.id, { status: "ready", work });
        }
        task.resolve(work);
      })
      .catch((error: unknown) => {
        if (!this.disposed) {
          this.onStateChange(task.id, { status: "error" });
        }
        task.reject(error);
      })
      .finally(() => {
        this.pending.delete(task.id);
        this.activeCount -= 1;
        this.pump();
      });
  }
}

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
      new EventWorkDetailQueue(
        async (id, signal) => {
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
        (id, state) => {
          setStates((current) => ({ ...current, [id]: state }));
        },
        2,
      ),
    [accessToken, invalidateAuthentication],
  );

  useEffect(() => () => queue.dispose(), [queue]);

  const load = useCallback(
    (id: string, priority = false) => queue.request(id, priority),
    [queue],
  );

  return { states, load };
}
