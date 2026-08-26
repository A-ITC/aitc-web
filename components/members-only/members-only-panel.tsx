import type { ComponentPropsWithoutRef, ReactNode } from "react";

type MembersOnlyPanelProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "className"
> & {
  children: ReactNode;
};

export function MembersOnlyPanel({
  children,
  ...props
}: MembersOnlyPanelProps) {
  return (
    <div
      className="mx-5 mt-11 mb-20 flex min-h-72 w-auto flex-col items-center justify-center border border-slate-200 bg-white px-6 py-10 text-center shadow-xl md:mx-auto md:mb-28 md:w-full md:max-w-3xl md:px-9 md:py-12"
      {...props}
    >
      {children}
    </div>
  );
}
