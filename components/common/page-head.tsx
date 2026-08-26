import type { ReactNode } from "react";

function PageHeadRoot({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-11 md:pt-24 md:pb-16">
      {children}
    </section>
  );
}

function PageHeadKicker({ children }: { children: ReactNode }) {
  return (
    <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">
      {children}
    </p>
  );
}

function PageHeadTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="my-3 text-4xl tracking-tighter md:text-7xl">{children}</h1>
  );
}

function PageHeadDescription({ children }: { children: ReactNode }) {
  return <p className="my-4 text-base text-slate-600">{children}</p>;
}

export const PageHead = Object.assign(PageHeadRoot, {
  Kicker: PageHeadKicker,
  Title: PageHeadTitle,
  Description: PageHeadDescription,
});
