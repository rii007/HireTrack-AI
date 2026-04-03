import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSearch } from "../state/SearchContext";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, LayoutGrid, Rows3, Search } from "lucide-react";
import { api } from "../lib/api";
import type { Job, JobStatus } from "../types";
import { JobForm } from "../components/jobs/JobForm";
import { JobTable } from "../components/jobs/JobTable";
import { KanbanBoard } from "../components/jobs/KanbanBoard";
import { clsx } from "clsx";

export function JobTrackerPage() {
  const location = useLocation() as { state?: { openForm?: boolean } };
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const { searchQuery, setSearchQuery } = useSearch();
  const [formOpen, setFormOpen] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (location.state?.openForm) {
      setFormOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", searchQuery],
    queryFn: async () => (await api.get("/jobs", { params: { search: searchQuery, limit: 200 } })).data,
  });

  const jobs: Job[] = data?.items || [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["jobs"] });

  const create = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post("/jobs", p),
    onSuccess: () => {
      refresh();
      toast.success("Application added to your pipeline");
      setFormOpen(false);
    },
    onError: () => toast.error("Could not save job — check required fields"),
  });

  const move = useMutation({
    mutationFn: ({ id, s }: { id: string; s: JobStatus }) => api.patch(`/jobs/${id}`, { status: s }),
    onSuccess: () => refresh(),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/jobs/${id}`),
    onSuccess: () => {
      refresh();
      toast.success("Application removed");
    },
  });

  const dup = useMutation({
    mutationFn: (id: string) => api.post(`/jobs/${id}/duplicate`),
    onSuccess: () => {
      refresh();
      toast.success("Duplicate created");
    },
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Job tracker</h1>
          <p className="page-subtitle max-w-xl">
            Capture roles, move them through your funnel, and keep context in one place. Columns scroll sideways on
            smaller screens.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200/80">
            {jobs.length} {jobs.length === 1 ? "application" : "applications"}
          </span>
        </div>
      </header>

      <section className="surface-card overflow-hidden ring-1 ring-slate-200/60">
        <button
          type="button"
          onClick={() => setFormOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50/80"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">New application</p>
            <p className="text-xs text-slate-500">
              {formOpen ? "Collapse to focus on your board" : "Expand to log company, role, dates, and links"}
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
            {formOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>
        {formOpen && (
          <div className="border-t border-slate-100 px-5 py-6 sm:px-8 sm:py-8">
            <JobForm onSubmit={async (v) => create.mutateAsync(v)} />
          </div>
        )}
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative min-w-0 max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="field-input bg-white pl-10"
            placeholder="Search company or role…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter jobs"
          />
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setView("kanban")}
            className={clsx(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
              view === "kanban" ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={clsx(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
              view === "table" ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Rows3 className="h-4 w-4" />
            Table
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-80 w-[280px] shrink-0 animate-pulse rounded-2xl bg-slate-200/80" />
          ))}
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard jobs={jobs} onMove={(id, status) => move.mutate({ id, s: status })} />
      ) : (
        <JobTable jobs={jobs} onDelete={(id) => del.mutate(id)} onDuplicate={(id) => dup.mutate(id)} />
      )}
    </div>
  );
}
