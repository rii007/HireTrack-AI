import { clsx } from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-xl bg-slate-200/90 dark:bg-slate-700/80",
        className
      )}
      aria-hidden
    />
  );
}
