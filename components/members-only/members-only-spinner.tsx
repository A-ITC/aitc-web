export function MembersOnlySpinner() {
  return (
    <span
      className="size-14 animate-spin rounded-full border-4 border-slate-200 border-t-orange-400 font-['DM_Mono',monospace] text-3xl leading-none font-bold motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}
