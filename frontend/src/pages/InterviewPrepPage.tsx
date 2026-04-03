import { useState } from "react";
import { api } from "../lib/api";

export function InterviewPrepPage() {
  const [roleOrCompany, setRoleOrCompany] = useState("");
  const [result, setResult] = useState<any>(null);
  return <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-2"><h3 className="font-semibold">AI Interview Prep Assistant</h3><input className="input" value={roleOrCompany} onChange={(e)=>setRoleOrCompany(e.target.value)} placeholder="Frontend Engineer at Stripe" /><button className="rounded-lg bg-indigo-600 text-white px-4 py-2" onClick={async ()=>setResult((await api.post("/ai/interview-prep", { roleOrCompany })).data)}>Generate</button>{result && <pre className="rounded-xl bg-slate-900 text-slate-100 text-xs p-4 overflow-auto">{JSON.stringify(result, null, 2)}</pre>}</section>;
}
