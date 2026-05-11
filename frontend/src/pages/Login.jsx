import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { api } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/user/login", { emailId, password });
      const id = res?.data?.data?._id;
      if (!id) throw new Error("We couldn't sign you in. Please try again.");
      localStorage.setItem("userId", id);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
        <div className="w-full animate-fade-in rounded-lg border border-border bg-card p-8 shadow-health">
          <div className="mb-6 flex items-start gap-3">
            <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-tight text-card-foreground">
                NeuroBridge
              </h1>
              <p className="text-sm text-muted-foreground">Your intelligent health companion</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              className="h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-health transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
            >
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-primary hover:underline" to="/signup">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
