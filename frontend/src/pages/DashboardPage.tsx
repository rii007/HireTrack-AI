import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  Calendar,
  TrendingUp,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  PartyPopper,
  CircleDot,
  Ban,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { api } from "../lib/api";
import type { Job, JobStatus } from "../types";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";

const metricStyle = [
  { icon: Briefcase, accent: "from-indigo-500 to-indigo-700", ring: "ring-indigo-500/15", to: "/jobs" },
  { icon: Calendar, accent: "from-violet-500 to-purple-700", ring: "ring-violet-500/15", to: "/jobs" },
  { icon: Award, accent: "from-emerald-500 to-teal-700", ring: "ring-emerald-500/15", to: "/jobs" },
  { icon: TrendingUp, accent: "from-amber-500 to-orange-600", ring: "ring-amber-500/15", to: "/analytics" },
];

function statusFeedMeta(status: JobStatus): { verb: string; Icon: LucideIcon } {
  switch (status) {
    case "Applied":
      return { verb: "Application activity", Icon: Briefcase };
    case "Online Assessment":
      return { verb: "Online assessment stage", Icon: CircleDot };
    case "Interview":
      return { verb: "Interview pipeline", Icon: Calendar };
    case "Offer":
      return { verb: "Offer stage", Icon: PartyPopper };
    case "Rejected":
      return { verb: "Closed out", Icon: Ban };
    default:
      return { verb: "Updated", Icon: Briefcase };
  }
}

export function DashboardPage() {
  const { data: analytics, isLoading: aLoad } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get("/analytics")).data,
  });
  const { data: recentRes } = useQuery({
    queryKey: ["jobs-recent"],
    queryFn: async () => (await api.get("/jobs", { params: { limit: 8, sortBy: "updatedAt", order: "desc" } })).data,
  });
  const { data: upcomingRes } = useQuery({
    queryKey: ["jobs-upcoming"],
    queryFn: async () => (await api.get("/jobs/upcoming-interviews")).data,
  });

  const m = analytics?.metrics || {};
  const cards: [string, string | number, string][] = [
    ["Total applications", m.totalApplications ?? 0, "Roles in your tracker"],
    ["In interviews", m.interviewsScheduled ?? 0, "Active interview stages"],
    ["Offers", m.offersReceived ?? 0, "Wins to celebrate"],
    ["Success rate", `${m.successRate ?? 0}%`, "Offers ÷ total apps"],
  ];

  const recent: Job[] = recentRes?.items || [];
  const upcoming: Job[] = upcomingRes?.items || [];
  const trend = (analytics?.perMonth || []).map((row: { _id: string; count: number }) => ({
    month: row._id,
    count: row.count,
  }));

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid var(--tooltip-border, #e2e8f0)",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
    background: "var(--tooltip-bg, #fff)",
    color: "var(--tooltip-fg, #0f172a)",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 lg:max-w-none xl:max-w-6xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle max-w-xl">
            Your funnel at a glance—applications, momentum, and what needs attention next.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/jobs"
            state={{ openForm: true }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0F172A]"
          >
            Add job
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/resume"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-indigo-500/30 dark:hover:bg-slate-800/80"
          >
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Analyze resume
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {aLoad
          ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)
          : cards.map(([label, value, hint], i) => {
              const Icon = metricStyle[i].icon;
              const to = metricStyle[i].to;
              return (
                <Link key={label} to={to} className="group metric-card-interactive">
                  <div
                    className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br opacity-[0.15] transition-opacity duration-300 group-hover:opacity-25 dark:opacity-20 ${metricStyle[i].accent}`}
                  />
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100 bg-gradient-to-br ${metricStyle[i].accent}`}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {label}
                      </p>
                      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                        {value}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
                    </div>
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${metricStyle[i].accent} ring-2 ${metricStyle[i].ring}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="relative mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Open {i === 3 ? "analytics" : "job board"} →
                  </p>
                </Link>
              );
            })}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="surface-card p-6 sm:p-8 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-900">Application volume</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">By month, based on applied date</p>
            </div>
            <Link
              to="/analytics"
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
            >
              Full analytics →
            </Link>
          </div>
          {trend.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No timeline yet"
              description="Once you add applications with dates, you’ll see how your monthly cadence trends—great for pacing outreach."
              actionLabel="Add an application"
              actionTo="/jobs"
              secondaryLabel="Import from resume match"
              secondaryTo="/resume"
            />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [`${v}`, "Applications"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#dashFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="surface-card flex flex-col p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Upcoming interviews</h2>
              <p className="text-xs text-slate-500">From your tracker</p>
            </div>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming interviews yet"
              description="Move a card to Interview and add a date—we’ll surface countdowns here so nothing slips."
              actionLabel="Open job board"
              actionTo="/jobs"
            />
          ) : (
            <ul className="flex-1 space-y-3">
              {upcoming.map((job) => (
                <li
                  key={job._id}
                  className="rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:-translate-y-px hover:border-indigo-200 hover:bg-slate-50 hover:shadow-md"
                >
                  <p className="font-semibold text-slate-900">{job.company}</p>
                  <p className="text-sm text-slate-600">{job.role}</p>
                  {job.interviewDate && (
                    <p className="mt-2 text-xs font-medium text-indigo-600">
                      {format(new Date(job.interviewDate), "MMM d, yyyy · h:mm a")} ·{" "}
                      {formatDistanceToNow(new Date(job.interviewDate), { addSuffix: true })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          {upcoming.length > 0 && (
            <Link
              to="/jobs"
              className="mt-4 text-center text-sm font-semibold text-indigo-600"
            >
              Open job board →
            </Link>
          )}
        </section>
      </div>

      <section className="surface-card p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Activity feed</h2>
            <p className="text-sm text-slate-500">Recent pipeline updates</p>
          </div>
          <Link to="/jobs" className="text-sm font-semibold text-indigo-600">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Your feed will appear here"
            description="Track roles and move them through stages—we’ll summarize changes so you always know what moved last."
            actionLabel="Start tracking"
            actionTo="/jobs"
            secondaryLabel="Analyze a resume"
            secondaryTo="/resume"
          />
        ) : (
          <ul className="relative space-y-0 pl-2">
            <span className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent dark:from-slate-700 dark:via-slate-700" />
            {recent.map((job) => {
              const { verb, Icon } = statusFeedMeta(job.status);
              const when = formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true });
              const applied =
                job.dateApplied &&
                formatDistanceToNow(new Date(job.dateApplied), { addSuffix: true });
              return (
                <li key={job._id} className="relative flex gap-4 pb-8 last:pb-0">
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-900">
                    <Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {verb} — <span className="text-indigo-600 dark:text-indigo-400">{job.company}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{job.role}</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                      Updated {when}
                      {applied ? ` · Applied ${applied}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
