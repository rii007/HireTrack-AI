import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  secondaryLabel,
  secondaryTo,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryTo?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="btn-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {actionLabel}
          </Link>
        )}
        {actionLabel && onAction && !actionTo && (
          <button
            type="button"
            onClick={onAction}
            className="btn-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {actionLabel}
          </button>
        )}
        {secondaryLabel && secondaryTo && (
          <Link
            to={secondaryTo}
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
