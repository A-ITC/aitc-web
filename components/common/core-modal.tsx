"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function CoreModal({
  ariaLabelledBy,
  children,
  onClose,
}: {
  ariaLabelledBy: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = [
        ...(modalRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? []),
      ];
      if (nodes.length === 0) return;

      const index = nodes.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        nodes.at(-1)?.focus();
      }
      if (!event.shiftKey && index === nodes.length - 1) {
        event.preventDefault();
        nodes[0]?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-slate-950/80 p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={modalRef}
        className="relative my-auto w-full max-w-3xl animate-[rise_0.2s_ease-out] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
      >
        <button
          ref={closeRef}
          className="absolute top-2.5 right-3 z-10 size-9 cursor-pointer rounded-full border-0 bg-white text-2xl text-slate-900"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        {children}
      </section>
    </div>
  );
}
