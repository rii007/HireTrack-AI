import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Upload, FileText, Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import { clsx } from "clsx";

type Report = Record<string, unknown> & {
  extractedText?: string;
  _meta?: { sourceFile?: string; charCount?: number };
};

type MatchResult = Record<string, unknown> & {
  matchScore?: number;
  matchPercentage?: number;
  atsScore?: number;
  matchedSkills?: unknown;
  missingSkills?: unknown;
  suggestions?: unknown;
  totalSkills?: number;
};

function ChipList({ title, items }: { title: string; items?: unknown }) {
  const list = Array.isArray(items) ? (items as string[]) : [];
  if (!list.length) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h4>
      <ul className="flex flex-wrap gap-2">
        {list.map((x) => (
          <li
            key={x}
            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 ring-1 ring-indigo-100"
          >
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BulletList({ title, items }: { title: string; items?: unknown }) {
  const list = Array.isArray(items) ? (items as string[]) : [];
  if (!list.length) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h4>
      <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
        {list.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

export function ResumeAnalyzerPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [busy, setBusy] = useState<"extract" | "match" | null>(null);
  const [drag, setDrag] = useState(false);

  // Extract text from uploaded file (NO API call, text extraction only)
  const onFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setBusy("extract");
    const fd = new FormData();
    fd.append("resume", file);
    try {
      console.log("[ResumeAnalyzer] Extracting text from file:", file.name);
      const { data } = await api.post("/ai/resume/extract", fd);
      console.log("[ResumeAnalyzer] Text extracted successfully:", data._meta);
      if (typeof data.extractedText === "string" && data.extractedText.length > 0) {
        setResumeText(data.extractedText);
        console.log("[ResumeAnalyzer] Resume text set:", data.extractedText.slice(0, 50) + "...");
        toast.success("Resume text extracted — paste it in the match section below.");
      } else {
        toast.success("Text extracted from resume.");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Upload failed";
      console.error("[ResumeAnalyzer] File extraction error:", msg);
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }, []);

  // Handle "Analyze Match" button click
  async function handleAnalyzeMatch() {
    console.log("[ResumeAnalyzer] Analyze Match clicked");
    console.log("[ResumeAnalyzer] Resume text length:", resumeText.length);
    console.log("[ResumeAnalyzer] Job description length:", jobDescription.length);

    // Validate both inputs exist and meet minimum length
    if (!resumeText || resumeText.trim().length < 40) {
      const errMsg = "Resume text must be at least 40 characters";
      console.warn("[ResumeAnalyzer] Validation failed:", errMsg);
      toast.error(errMsg);
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 40) {
      const errMsg = "Job description must be at least 40 characters";
      console.warn("[ResumeAnalyzer] Validation failed:", errMsg);
      toast.error(errMsg);
      return;
    }

    setBusy("match");
    setMatch(null);

    try {
      console.log("[ResumeAnalyzer] Calling match API...");
      const payload = { resumeText: resumeText.trim(), jobDescription: jobDescription.trim() };
      const { data } = await api.post("/ai/resume/match", payload);
      console.log("[ResumeAnalyzer] Match API response:", data);
      setMatch(data);
      toast.success("Match analysis complete!");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Match request failed";
      console.error("[ResumeAnalyzer] Match API error:", msg, e?.response?.data);
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  const atsScore = report?.atsScore;
  const note = report?.note as string | undefined;
  const canAnalyze = resumeText.trim().length >= 40 && jobDescription.trim().length >= 40;
  const matchScore = typeof match?.matchScore === "number"
    ? match.matchScore
    : typeof match?.matchPercentage === "number"
      ? match.matchPercentage
      : typeof match?.atsScore === "number"
        ? match.atsScore
        : undefined;
  const matchedSkills = match?.matchedSkills;
  const missingSkills = match?.missingSkills;
  const suggestions = match?.suggestions;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header>
        <h1 className="page-title">Resume analyzer</h1>
        <p className="page-subtitle max-w-2xl">
          Upload a PDF or DOCX for ATS-style feedback and keyword insights. Use the match tool with a job description to
          see gaps before you apply.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="surface-card p-6 sm:p-8">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Upload resume</h2>
              <p className="mt-1 text-sm text-slate-500">
                Drag and drop or choose a file. We extract text locally, then send it to the AI layer.
              </p>
            </div>
          </div>

          <div
            role="presentation"
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void onFile(f);
            }}
            className={clsx(
              "flex min-h-50 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition",
              drag ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
            )}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              id="resume-file"
              disabled={busy === "extract"}
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <label htmlFor="resume-file" className="flex cursor-pointer flex-col items-center text-center">
              {busy === "extract" ? (
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              ) : (
                <FileText className="h-10 w-10 text-slate-400" />
              )}
              <span className="mt-3 text-sm font-semibold text-slate-800">
                {busy === "extract" ? "Extracting…" : "Drop file here or browse"}
              </span>
              <span className="mt-1 text-xs text-slate-500">PDF or DOCX · max ~6MB</span>
            </label>
          </div>

          {note && (
            <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{note}</span>
            </div>
          )}
        </section>

        <section className="surface-card p-6 sm:p-8">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Job description match</h2>
              <p className="mt-1 text-sm text-slate-500">
                Paste your resume text and the job posting. Each field needs at least 40 characters.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="resume-paste">
                Resume text
              </label>
              <textarea
                id="resume-paste"
                className="field-textarea min-h-40"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste resume text here (or upload a file on the left to auto-fill)…"
              />
              <p className="mt-1 text-xs text-slate-400">{resumeText.length} characters</p>
            </div>
            <div>
              <label className="field-label" htmlFor="jd-paste">
                Job description
              </label>
              <textarea
                id="jd-paste"
                className="field-textarea min-h-40"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description…"
              />
              <p className="mt-1 text-xs text-slate-400">{jobDescription.length} characters</p>
            </div>
            <button
              type="button"
              onClick={handleAnalyzeMatch}
              disabled={busy === "match" || !canAnalyze}
              className="btn-primary"
            >
              {busy === "match" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing match…
                </>
              ) : (
                "Analyze match"
              )}
            </button>
          </div>
        </section>
      </div>

      {report && (
        <section className="surface-card overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Analysis report
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {report._meta?.sourceFile ? `${report._meta.sourceFile} · ` : ""}
              {report._meta?.charCount != null ? `${report._meta.charCount} characters extracted` : ""}
            </p>
          </div>
          <div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-8">
            {typeof atsScore === "number" && (
              <div className="rounded-2xl bg-linear-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-indigo-600/20">
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">ATS-style score</p>
                <p className="mt-2 text-5xl font-bold tabular-nums">{Math.round(atsScore)}</p>
                <p className="mt-2 text-sm text-white/85">Heuristic composite — tune with real JD keywords.</p>
              </div>
            )}
            {typeof report.summary === "string" && report.summary && (
              <div className="sm:col-span-2">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Summary</h4>
                <p className="text-sm leading-relaxed text-slate-700">{report.summary}</p>
              </div>
            )}
            <div className="space-y-6 sm:col-span-2">
              <ChipList title="Extracted skills" items={report.extractedSkills} />
              <BulletList title="Strengths" items={report.strengths} />
              <BulletList title="Weak areas" items={report.weakAreas} />
              <BulletList title="Suggestions" items={report.suggestions} />
              <BulletList title="Missing keywords" items={report.missingKeywords} />
            </div>
          </div>
        </section>
      )}

      {match && (
        <section className="surface-card overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Role match
            </h3>
          </div>
          <div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-8">
            {typeof matchScore === "number" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Match score</p>
                <p className="mt-2 text-4xl font-bold text-indigo-600 tabular-nums">
                  {Math.round(matchScore)}%
                </p>
              </div>
            )}
            {typeof matchScore !== "number" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Match score</p>
                <p className="mt-2 text-sm text-slate-500">No score returned.</p>
              </div>
            )}
            <div className="space-y-6 sm:col-span-2">
              <ChipList title="Matched skills" items={matchedSkills} />
              <BulletList title="Missing skills" items={missingSkills} />
              <BulletList title="Suggestions" items={suggestions} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
