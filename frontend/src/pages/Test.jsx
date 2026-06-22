import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  Brain,
  Droplets,
  Flame,
  Footprints,
  HeartPulse,
  RotateCcw,
  Server,
} from "lucide-react";
import Nav from "../components/Nav";
import { api } from "../api/client";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const normalizeRealtime = (payload) => {
  if (!payload) return null;
  if (payload.data && typeof payload.data === "object") return payload.data;
  return payload;
};

function MetricCard({ icon: Icon, label, value, unit }) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {value ?? "—"}
            {value != null && unit ? (
              <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Test() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [latestRealtime, setLatestRealtime] = useState(null);

  const SIMULATOR_BASE =
    import.meta.env.VITE_SIMULATOR_URL || "http://localhost:4000";

  useEffect(() => {
    let cancelled = false;

    const loadLatestRealtime = async () => {
      try {
        const res = await api.get("/realtime/latest");
        if (cancelled) return;
        setLatestRealtime(normalizeRealtime(res?.data));
      } catch {
        if (!cancelled) setLatestRealtime(null);
      }
    };

    loadLatestRealtime();
    const intervalId = setInterval(loadLatestRealtime, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const refreshLatestRealtime = async () => {
    try {
      const res = await api.get("/realtime/latest");
      setLatestRealtime(normalizeRealtime(res?.data));
    } catch {
      // Keep the last known reading visible if refresh fails.
    }
  };

  const sendSimulator = async (endpoint, body) => {
    setError("");
    setBusy(true);
    try {
      const res = await axios.post(`${SIMULATOR_BASE}${endpoint}`, body || {});
      setResult(res.data);
      await refreshLatestRealtime();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Simulator request failed");
    } finally {
      setBusy(false);
    }
  };

  const sendRealtime = async (payload) => {
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/realtime", payload);
      setResult(res.data);
      await refreshLatestRealtime();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const now = () => new Date().toISOString();

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">System Test</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Simulate events and validate data flow end-to-end.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card p-5 shadow-health">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Server className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Simulator Controls</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground shadow-health transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
                onClick={() =>
                  sendSimulator("/override", {
                    heart_rate: 195,
                    spo2: 88,
                    stress_level: 10,
                  })
                }
              >
                <HeartPulse className="h-4 w-4" />
                Heart Attack Simulation
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
                onClick={() => sendSimulator("/reset")}
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Normal
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-md bg-warning px-3 py-2 text-sm font-medium text-warning-foreground shadow-health transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
                onClick={() =>
                  sendSimulator("/override", {
                    heart_rate: 105,
                    spo2: 96,
                    stress_level: 5,
                  })
                }
              >
                <AlertTriangle className="h-4 w-4" />
                Small Alert
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground shadow-health transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
                onClick={() =>
                  sendSimulator("/override", {
                    heart_rate: 80,
                    spo2: 97,
                    stress_level: 92,
                  })
                }
              >
                <Brain className="h-4 w-4" />
                Highly Stressed
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-health">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <HeartPulse className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Create Sample Reading</h2>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-health transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() =>
                sendRealtime({
                  heart_rate: 90,
                  spo2: 98,
                  stress_level: 2,
                  steps: 200,
                  calories_burned: 60,
                  timestamp: now(),
                })
              }
            >
              {busy ? "Sending..." : "Send sample record"}
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              Use this to verify ingestion and dashboard updates.
            </p>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-health">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Latest Realtime Values</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Updated from the most recent button action or backend reading.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Last update: <span className="font-medium text-foreground">{formatDateTime(latestRealtime?.timestamp)}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard icon={Activity} label="Heart Rate" value={latestRealtime?.heart_rate} unit="bpm" />
            <MetricCard icon={Droplets} label="SpO₂" value={latestRealtime?.spo2} unit="%" />
            <MetricCard icon={Brain} label="Stress Level" value={latestRealtime?.stress_level} />
            <MetricCard icon={Footprints} label="Steps" value={latestRealtime?.steps} />
            <MetricCard icon={Flame} label="Calories" value={latestRealtime?.calories_burned} unit="kcal" />
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-health">
          <h2 className="text-sm font-semibold text-foreground">Response</h2>
          <div className="mt-3 overflow-hidden rounded-md border border-border bg-slate-950">
            <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-relaxed text-slate-50">
              {result ? JSON.stringify(result, null, 2) : "No response yet."}
            </pre>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Simulator endpoint: <span className="font-mono">{SIMULATOR_BASE}</span>
          </div>
        </section>
      </div>
    </div>
  );
}

