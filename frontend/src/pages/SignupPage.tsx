import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function SignupPage() {
  const { register, handleSubmit } = useForm();
  const nav = useNavigate();
  const { signup } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-100 to-white">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">HireTrack AI</h1>
          <p className="mt-2 text-sm text-slate-500">Create your workspace and track interviews effortlessly.</p>
        </div>
        <form
          className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
          onSubmit={handleSubmit(async (v: { name?: string; email?: string; password?: string }) => {
            await signup(v.name!, v.email!, v.password!);
            nav("/");
          })}
        >
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Create account</h2>
          <input className="input mb-4" {...register("name")} placeholder="Name" autoComplete="name" />
          <input className="input mb-4" type="email" {...register("email")} placeholder="Email" autoComplete="email" />
          <input
            className="input mb-6"
            type="password"
            {...register("password")}
            placeholder="Password"
            autoComplete="new-password"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Create account
          </button>
          <p className="mt-4 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
