const logoSizeClasses = {
  default: "text-2xl",
  hero: "text-7xl md:text-8xl",
} as const;

export function Logo({ size = "default" }: { size?: keyof typeof logoSizeClasses }) {
  return (
    <span
      className={`font-['Noto_Sans_JP',sans-serif] leading-none font-extrabold tracking-tighter text-slate-900 ${logoSizeClasses[size]}`}
      aria-label="AITC"
    >
      <span className="bg-[image:var(--accent-gradient)] bg-clip-text text-[var(--blue)] [-webkit-text-fill-color:transparent]">
        A
      </span>
      ITC
    </span>
  );
}
