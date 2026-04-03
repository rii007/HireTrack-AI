import { useEffect, type ComponentType } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Briefcase,
  MapPin,
  Link2,
  FileText,
  Sparkles,
} from "lucide-react";
import { api } from "../lib/api";

type ProfileForm = {
  name: string;
  headline: string;
  bio: string;
  targetRolesText: string;
  skillsText: string;
  locationsText: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  yearsExperience: string;
};

function splitList(s: string) {
  return s
    .split(/[,;\n]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/profile")).data,
  });

  const { register, handleSubmit, reset, formState } = useForm<ProfileForm>({
    defaultValues: {
      name: "",
      headline: "",
      bio: "",
      targetRolesText: "",
      skillsText: "",
      locationsText: "",
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      yearsExperience: "",
    },
  });

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      headline: data.headline ?? "",
      bio: data.bio ?? "",
      targetRolesText: (data.targetRoles ?? []).join(", "),
      skillsText: (data.skills ?? []).join(", "),
      locationsText: (data.preferredLocations ?? []).join(", "),
      linkedinUrl: data.linkedinUrl ?? "",
      githubUrl: data.githubUrl ?? "",
      portfolioUrl: data.portfolioUrl ?? "",
      yearsExperience:
        data.yearsExperience !== undefined && data.yearsExperience !== null
          ? String(data.yearsExperience)
          : "",
    });
  }, [data, reset]);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.patch("/profile", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    },
    onError: () => toast.error("Could not save profile"),
  });

  const onSubmit = (v: ProfileForm) => {
    const years = v.yearsExperience.trim() === "" ? undefined : Number(v.yearsExperience);
    save.mutate({
      name: v.name.trim(),
      headline: v.headline.trim() || undefined,
      bio: v.bio.trim() || undefined,
      targetRoles: splitList(v.targetRolesText),
      skills: splitList(v.skillsText),
      preferredLocations: splitList(v.locationsText),
      linkedinUrl: v.linkedinUrl.trim(),
      githubUrl: v.githubUrl.trim(),
      portfolioUrl: v.portfolioUrl.trim(),
      yearsExperience: Number.isFinite(years) ? years : undefined,
    });
  };

  if (isLoading && !data) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 rounded-2xl bg-slate-200 lg:col-span-2" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle max-w-xl">
            Keep your story, links, and job-search focus in one place. Recruiters skim headlines and
            links first—make them count.
          </p>
        </div>
        <button
          type="submit"
          form="profile-form"
          disabled={save.isPending || !formState.isDirty}
          className="btn-primary shrink-0"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </header>

      <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="surface-card p-6 sm:p-8">
            <SectionHeader
              icon={UserIcon}
              title="Identity"
              description="How you appear across the product and in exports."
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="pf-name">
                  Full name
                </label>
                <input id="pf-name" className="field-input" {...register("name", { required: true })} />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="pf-headline">
                  Professional headline
                </label>
                <input
                  id="pf-headline"
                  className="field-input"
                  placeholder="e.g. Senior Product Designer · B2B SaaS"
                  {...register("headline")}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="pf-years">
                  Years of experience
                </label>
                <input
                  id="pf-years"
                  type="number"
                  min={0}
                  max={80}
                  className="field-input"
                  placeholder="e.g. 5"
                  {...register("yearsExperience")}
                />
              </div>
            </div>
          </section>

          <section className="surface-card p-6 sm:p-8">
            <SectionHeader
              icon={Briefcase}
              title="Career focus"
              description="Roles you are targeting and skills you want highlighted."
            />
            <div className="grid gap-6">
              <div>
                <label className="field-label" htmlFor="pf-roles">
                  Target roles
                </label>
                <textarea
                  id="pf-roles"
                  className="field-textarea min-h-[120px]"
                  placeholder="e.g. Staff Engineer, Technical Lead, Platform (one per line or comma-separated)"
                  {...register("targetRolesText")}
                />
                <p className="mt-2 text-xs text-slate-400">Separate with commas, semicolons, or new lines.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="pf-skills">
                    Core skills
                  </label>
                  <textarea
                    id="pf-skills"
                    className="field-textarea min-h-[140px]"
                    placeholder="TypeScript, system design, leadership, stakeholder management…"
                    {...register("skillsText")}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="pf-loc">
                    Preferred locations
                  </label>
                  <textarea
                    id="pf-loc"
                    className="field-textarea min-h-[140px]"
                    placeholder="Remote · SF Bay Area · London…"
                    {...register("locationsText")}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="surface-card p-6 sm:p-8">
            <SectionHeader
              icon={Link2}
              title="Online presence"
              description="Links are validated when you save—use full URLs including https://"
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="pf-li">
                  LinkedIn
                </label>
                <input
                  id="pf-li"
                  type="url"
                  className="field-input"
                  placeholder="https://www.linkedin.com/in/…"
                  {...register("linkedinUrl")}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="pf-gh">
                  GitHub
                </label>
                <input
                  id="pf-gh"
                  type="url"
                  className="field-input"
                  placeholder="https://github.com/…"
                  {...register("githubUrl")}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="pf-port">
                  Portfolio / personal site
                </label>
                <input
                  id="pf-port"
                  type="url"
                  className="field-input"
                  placeholder="https://…"
                  {...register("portfolioUrl")}
                />
              </div>
            </div>
          </section>

          <section className="surface-card p-6 sm:p-8">
            <SectionHeader
              icon={FileText}
              title="About you"
              description="A short narrative for resume context and future AI features."
            />
            <label className="field-label" htmlFor="pf-bio">
              Bio / summary
            </label>
            <textarea
              id="pf-bio"
              className="field-textarea min-h-[200px]"
              placeholder="What you build, what you care about, and the problems you want to work on next. This space is yours—go deep."
              {...register("bio")}
            />
            <p className="mt-2 text-xs text-slate-400">Up to about 4,000 characters. Plain text is fine.</p>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-1">
          <div className="surface-card p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Account
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-900">{data?.email ?? "—"}</p>
                  <p className="mt-2 text-xs text-slate-500">Sign-in identifier. Contact support to change.</p>
                </div>
              </div>
              {data?.headline ? (
                <p className="text-sm leading-relaxed text-slate-600">{data.headline}</p>
              ) : (
                <p className="text-sm italic text-slate-400">Add a headline to sharpen your profile card.</p>
              )}
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-indigo-600" />
              Snapshot
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Target roles</span>
                <span className="font-medium text-slate-900">{data?.targetRoles?.length ?? 0}</span>
              </li>
              <li className="flex justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Skills</span>
                <span className="font-medium text-slate-900">{data?.skills?.length ?? 0}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-slate-500">Locations</span>
                <span className="font-medium text-slate-900">{data?.preferredLocations?.length ?? 0}</span>
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
