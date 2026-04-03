import { formatDistanceToNow } from "date-fns";
import { Copy, Trash2 } from "lucide-react";
import type { Job, JobStatus } from "../../types";
import { clsx } from "clsx";

const statusStyle: Record<JobStatus, string> = {
  Applied: "bg-slate-100 text-slate-800 ring-slate-200/80",
  "Online Assessment": "bg-violet-100 text-violet-900 ring-violet-200/80",
  Interview: "bg-indigo-100 text-indigo-900 ring-indigo-200/80",
  Offer: "bg-emerald-100 text-emerald-900 ring-emerald-200/80",
  Rejected: "bg-rose-100 text-rose-900 ring-rose-200/80",
};

export function JobTable({
  jobs,
  onDelete,
  onDuplicate,
}: {
  jobs: Job[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  if (jobs.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-slate-600">No applications match your search</p>
        <p className="mt-1 text-xs text-slate-400">Try clearing filters or add a new role</p>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden ring-1 ring-slate-200/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Company</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Location</th>
              <th className="px-5 py-3.5">Updated</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((j) => (
              <tr key={j._id} className="transition hover:bg-indigo-50/30">
                <td className="px-5 py-4 font-semibold text-slate-900">{j.company}</td>
                <td className="px-5 py-4 text-slate-700">{j.role}</td>
                <td className="px-5 py-4">
                  <span
                    className={clsx(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                      statusStyle[j.status]
                    )}
                  >
                    {j.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">{j.location || "—"}</td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {formatDistanceToNow(new Date(j.updatedAt), { addSuffix: true })}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onDuplicate(j._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Clone
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(j._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-transparent bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
