import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

export type JobFormValues = Record<string, string | number | undefined>;

export function JobForm({ onSubmit }: { onSubmit: (v: JobFormValues) => Promise<unknown> }) {
  const { register, handleSubmit, reset } = useForm<JobFormValues>();

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (v) => {
        const payload = {
          ...v,
          salary: v.salary === "" || v.salary === undefined ? undefined : Number(v.salary),
        };
        await onSubmit(payload);
        reset();
      })}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="field-label" htmlFor="jf-company">
            Company
          </label>
          <input id="jf-company" className="field-input" {...register("company", { required: true })} placeholder="e.g. Stripe" />
        </div>
        <div>
          <label className="field-label" htmlFor="jf-role">
            Role
          </label>
          <input id="jf-role" className="field-input" {...register("role", { required: true })} placeholder="e.g. Senior Frontend Engineer" />
        </div>
        <div>
          <label className="field-label" htmlFor="jf-location">
            Location
          </label>
          <input id="jf-location" className="field-input" {...register("location")} placeholder="Remote · SF · Hybrid" />
        </div>
        <div>
          <label className="field-label" htmlFor="jf-status">
            Status
          </label>
          <select id="jf-status" className="field-input" {...register("status")}>
            <option value="Applied">Applied</option>
            <option value="Online Assessment">Online Assessment</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="jf-salary">
            Salary (optional)
          </label>
          <input id="jf-salary" type="number" className="field-input" {...register("salary")} placeholder="e.g. 180000" />
        </div>
        <div>
          <label className="field-label" htmlFor="jf-url">
            Posting URL
          </label>
          <input id="jf-url" type="url" className="field-input" {...register("postingUrl")} placeholder="https://…" />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="jf-applied">
            Date applied
          </label>
          <input id="jf-applied" type="date" className="field-input" {...register("dateApplied")} />
        </div>
        <div>
          <label className="field-label" htmlFor="jf-int">
            Interview date
          </label>
          <input id="jf-int" type="datetime-local" className="field-input" {...register("interviewDate")} />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="jf-notes">
          Notes
        </label>
        <textarea
          id="jf-notes"
          className="field-textarea min-h-[88px]"
          {...register("notes")}
          placeholder="Recruiter name, referrals, follow-ups…"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary inline-flex gap-2">
          <Plus className="h-4 w-4" />
          Add to pipeline
        </button>
        <p className="text-xs text-slate-500">Required: company and role only.</p>
      </div>
    </form>
  );
}
