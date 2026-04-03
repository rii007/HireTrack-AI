import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { formatDistanceToNow } from "date-fns";
import { Building2, GripVertical, MapPin } from "lucide-react";
import type { Job, JobStatus } from "../../types";
import { clsx } from "clsx";

const cols: JobStatus[] = ["Applied", "Online Assessment", "Interview", "Offer", "Rejected"];

const columnTheme: Record<JobStatus, { bar: string; bg: string; badge: string }> = {
  Applied: { bar: "bg-slate-400", bg: "from-slate-50 to-slate-100/80", badge: "bg-slate-100 text-slate-700 ring-slate-200/80" },
  "Online Assessment": { bar: "bg-violet-500", bg: "from-violet-50 to-violet-100/60", badge: "bg-violet-100 text-violet-800 ring-violet-200/80" },
  Interview: { bar: "bg-indigo-500", bg: "from-indigo-50 to-blue-50/80", badge: "bg-indigo-100 text-indigo-800 ring-indigo-200/80" },
  Offer: { bar: "bg-emerald-500", bg: "from-emerald-50 to-teal-50/70", badge: "bg-emerald-100 text-emerald-800 ring-emerald-200/80" },
  Rejected: { bar: "bg-rose-400", bg: "from-rose-50 to-red-50/50", badge: "bg-rose-100 text-rose-800 ring-rose-200/80" },
};

export function KanbanBoard({ jobs, onMove }: { jobs: Job[]; onMove: (id: string, status: JobStatus) => void }) {
  const onDragEnd = (r: DropResult) => {
    if (!r.destination) return;
    onMove(r.draggableId, r.destination.droppableId as JobStatus);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="-mx-1 flex gap-4 overflow-x-auto pb-4 pt-1">
        {cols.map((status) => {
          const columnJobs = jobs.filter((j) => j.status === status);
          const theme = columnTheme[status];
          return (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={clsx(
                    "flex w-[min(100%,280px)] shrink-0 flex-col rounded-2xl border border-slate-200/90 bg-gradient-to-b shadow-sm ring-1 ring-slate-200/40",
                    theme.bg,
                    snapshot.isDraggingOver && "ring-2 ring-indigo-400/50"
                  )}
                >
                  <div className="flex items-center gap-2 border-b border-slate-200/60 px-4 py-3">
                    <span className={clsx("h-2 w-2 shrink-0 rounded-full", theme.bar)} aria-hidden />
                    <h3 className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{status}</h3>
                    <span
                      className={clsx(
                        "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold ring-1",
                        theme.badge
                      )}
                    >
                      {columnJobs.length}
                    </span>
                  </div>
                  <div className="flex min-h-[120px] flex-1 flex-col gap-2.5 p-3">
                    {columnJobs.length === 0 && (
                      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 bg-white/40 px-3 py-8 text-center">
                        <p className="text-xs font-medium text-slate-500">Drop cards here</p>
                        <p className="mt-1 text-[11px] text-slate-400">No applications in this stage</p>
                      </div>
                    )}
                    {columnJobs.map((job, idx) => (
                      <Draggable draggableId={job._id} index={idx} key={job._id}>
                        {(dragProvided, dragSnapshot) => (
                          <article
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={clsx(
                              "group rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm transition",
                              "hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5",
                              dragSnapshot.isDragging && "rotate-1 scale-[1.02] border-indigo-300 shadow-lg ring-2 ring-indigo-200"
                            )}
                          >
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="mt-0.5 cursor-grab touch-none rounded-md p-0.5 text-slate-400 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing hover:bg-slate-100 hover:text-slate-600"
                                {...dragProvided.dragHandleProps}
                                aria-label="Drag card"
                              >
                                <GripVertical className="h-4 w-4" />
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                  <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                  <p className="font-semibold leading-tight text-slate-900">{job.company}</p>
                                </div>
                                <p className="mt-1.5 pl-[1.375rem] text-sm text-slate-600">{job.role}</p>
                                {job.location ? (
                                  <p className="mt-2 flex items-center gap-1 pl-[1.375rem] text-xs text-slate-500">
                                    <MapPin className="h-3 w-3 shrink-0" />
                                    {job.location}
                                  </p>
                                ) : null}
                                <p className="mt-2 pl-[1.375rem] text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                  Updated {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </article>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
