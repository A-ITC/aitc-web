import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

const baseClassName =
  "inline-flex min-w-44 cursor-pointer items-center justify-center gap-2 rounded-sm border-0 bg-[image:var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 underline underline-offset-2 enabled:hover:-translate-y-px enabled:hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400 disabled:cursor-wait disabled:opacity-60";

type ActionButtonProps =
  | ({
      as?: "button";
      children: ReactNode;
    } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({
      as: "span";
      children: ReactNode;
    } & HTMLAttributes<HTMLSpanElement>);

function getClassName(className?: string) {
  return className ? `${baseClassName} ${className}` : baseClassName;
}

export function ActionButton(props: ActionButtonProps) {
  if (props.as === "span") {
    const { as: _as, className, ...spanProps } = props;

    return <span className={getClassName(className)} {...spanProps} />;
  }

  const { as: _as, className, type = "button", ...buttonProps } = props;

  return (
    <button
      type={type}
      className={getClassName(className)}
      {...buttonProps}
    />
  );
}
