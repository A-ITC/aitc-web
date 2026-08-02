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
    <section className="section timeline">
      <p className="kicker">EVENT HISTORY</p>
      <h2>イベント年表</h2>
      <div>
        {events.map(([event, year]) => (
          <Link
            key={event}
            href={`/event-works?event=${encodeURIComponent(event)}`}
          >
            <b>{year}</b>
            <span>{event}</span>
            <i>→</i>
          </Link>
        ))}
      </div>
    </section>
  );
}
