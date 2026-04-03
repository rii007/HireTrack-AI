import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function LoginPage() {
  const { register, handleSubmit } = useForm();
  const nav = useNavigate();
  const { login } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-100 to-white">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">HireTrack AI</h1>
          <p className="mt-2 text-sm text-slate-500">Launch your career operations with clarity and momentum.</p>
        </div>
        <form
          className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
          onSubmit={handleSubmit(async (v: { email?: string; password?: string }) => {
            await login(v.email!, v.password!);
            nav("/");
          })}
        >
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Welcome back</h2>
          <input className="input mb-4" type="email" autoComplete="email" {...register("email")} placeholder="Email" />
          <input
            className="input mb-6"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            placeholder="Password"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Login
          </button>
          <p className="mt-4 text-center text-sm text-slate-600">
            New user?{" "}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
