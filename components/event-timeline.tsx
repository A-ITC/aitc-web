"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchEventWorks } from "@/lib/api";
import { EventWork } from "./data";

export function EventTimeline() {
  const [works, setWorks] = useState<EventWork[]>([]);

  useEffect(() => {
    fetchEventWorks()
      .then(setWorks)
      .catch(() => setWorks([]));
  }, []);

  const events = [
    ...new Map(works.map((work) => [work.event, work.year])).entries(),
  ].sort((a, b) => b[1] - a[1]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-28">
      <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">EVENT HISTORY</p>
      <h2 className="mt-3 mb-8 text-3xl leading-snug tracking-tighter md:text-5xl">イベント年表</h2>
      <div className="border-t border-slate-200">
        {events.map(([event, year]) => (
          <Link
            key={event}
            href={`/event-works?event=${encodeURIComponent(event)}`}
            className="grid grid-cols-12 border-b border-slate-200 px-1 py-5 transition-all duration-200 hover:pl-3 hover:text-[var(--blue)]"
          >
            <b className="col-span-3 font-['DM_Mono',monospace] text-base">{year}</b>
            <span className="col-span-8">{event}</span>
            <i className="col-span-1 not-italic">→</i>
          </Link>
        ))}
      </div>
    </section>
  );
}
