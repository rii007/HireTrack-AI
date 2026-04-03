import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { BarChart3, PieChart as PieIcon, Route } from "lucide-react";
import { api } from "../lib/api";

const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9"];

const statusLabel = (id: string | null) => id || "Unknown";

export function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get("/analytics")).data,
  });

  const m = data?.metrics || {};
  const byStatus = (data?.byStatus || []).map((r: { _id: string; count: number }) => ({
    name: statusLabel(r._id),
    value: r.count,
  }));
  const perMonth = data?.perMonth || [];
  const funnel = (data?.funnel || []).map((f: { name: string; value: number }, i: number) => ({
    name: f.name,
    value: f.value,
    fill: COLORS[i % COLORS.length],
  }));

  const summaryCards = [
    { label: "Total applications", value: m.totalApplications ?? 0 },
    { label: "Interviews", value: m.interviewsScheduled ?? 0 },
    { label: "Offers", value: m.offersReceived ?? 0 },
    { label: "Rejections", value: m.rejectionCount ?? 0 },
    { label: "Success rate", value: `${m.successRate ?? 0}%` },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle max-w-2xl">
          Where your applications go—status mix, monthly cadence, and pipeline funnel.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200/80" />
          ))}
        </div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map((c) => (
            <div
              key={c.label}
              className="surface-card px-4 py-4 ring-1 ring-slate-200/50"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{c.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{c.value}</p>
            </div>
          ))}
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="surface-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <PieIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Status distribution</h2>
              <p className="text-sm text-slate-500">Share of applications by stage</p>
            </div>
          </div>
          {byStatus.length === 0 ? (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 text-sm text-slate-500">
              Add jobs to see this chart
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {byStatus.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="surface-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Applications per month</h2>
              <p className="text-sm text-slate-500">Based on applied date</p>
            </div>
          </div>
          {perMonth.length === 0 ? (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 text-sm text-slate-500">
              No monthly data yet
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.06)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
                    }}
                  />
                  <Bar dataKey="count" name="Applications" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <section className="surface-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Route className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Interview funnel</h2>
            <p className="text-sm text-slate-500">Applied → OA → Interview → Offer (raw counts)</p>
          </div>
        </div>
        {funnel.every((f: { value: number }) => f.value === 0) ? (
          <div className="mx-auto flex h-48 max-w-3xl items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 text-sm text-slate-500">
            Funnel stages fill in as you move cards through Applied → OA → Interview → Offer
          </div>
        ) : (
          <div className="mx-auto h-64 w-full max-w-3xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnel} margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
                  }}
                />
                <Bar dataKey="value" name="Applications" radius={[0, 8, 8, 0]}>
                  {funnel.map((entry: { fill: string }, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
