import { useEffect, useState } from "react";
import { Brain, Moon, Zap } from "lucide-react";
import Nav from "../components/Nav";
import { api } from "../api/client";

const qualityTone = (q) => {
  if (!q) return "muted";
  const v = q.toString().toLowerCase();
  if (v === "good") return "success";
  if (v === "average") return "warning";
  if (v === "poor") return "danger";
  return "muted";
};

const toneClasses = {
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  danger: "border-destructive/20 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

function Card({ icon: Icon, title, value, subtitle, right }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-health">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
            {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

function StressBar({ value }) {
  const v = value == null ? null : Number(value);
  const clamped = v == null || Number.isNaN(v) ? 0 : Math.max(0, Math.min(100, v));
  const tone =
    v == null || Number.isNaN(v) ? "muted" : v <= 40 ? "success" : v <= 60 ? "warning" : "danger";
  const bar =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-destructive"
          : "bg-muted";
  return (
    <div className="w-44">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>High</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={["h-full", bar].join(" ")} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export default function MentalHealth() {
  const [latest, setLatest] = useState(null);
  const [daily, setDaily] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [r, d] = await Promise.all([api.get("/realtime/latest"), api.get("/daily/latest")]);
        if (cancelled) return;
        setLatest(r?.data?.data || null);
        setDaily(d?.data?.data || null);
      } catch (err) {
        setError(err?.response?.data?.error || err?.message || "Failed to load mental health data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Mental Health</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stress and recovery insights from your recent activity and sleep.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {loading ? (
            <>
              <div className="h-[120px] animate-pulse rounded-lg border border-border bg-card shadow-health" />
              <div className="h-[120px] animate-pulse rounded-lg border border-border bg-card shadow-health" />
              <div className="h-[120px] animate-pulse rounded-lg border border-border bg-card shadow-health" />
              <div className="h-[120px] animate-pulse rounded-lg border border-border bg-card shadow-health" />
            </>
          ) : (
            <>
              <Card
                icon={Brain}
                title="Stress Level"
                value={latest?.stress_level ?? "—"}
                subtitle={latest?.stress_level != null ? "Based on your recent readings" : "No stress data yet"}
                right={<StressBar value={latest?.stress_level} />}
              />
              <Card
                icon={Moon}
                title="Sleep Duration"
                value={
                  daily?.sleep_duration != null || daily?.sleepDuration != null
                    ? `${daily?.sleep_duration ?? daily?.sleepDuration} hrs`
                    : "—"
                }
                subtitle="Last recorded sleep window"
                right={
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-xs font-medium",
                      toneClasses[qualityTone(daily?.sleep_quality ?? daily?.sleepQuality)],
                    ].join(" ")}
                  >
                    {daily?.sleep_quality ?? daily?.sleepQuality ?? "—"}
                  </span>
                }
              />
              <Card
                icon={Moon}
                title="Sleep Quality"
                value={daily?.sleep_quality ?? daily?.sleepQuality ?? "—"}
                subtitle="Recovery indicator"
                right={
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-xs font-medium",
                      toneClasses[qualityTone(daily?.sleep_quality ?? daily?.sleepQuality)],
                    ].join(" ")}
                  >
                    {qualityTone(daily?.sleep_quality ?? daily?.sleepQuality) === "success"
                      ? "Good"
                      : qualityTone(daily?.sleep_quality ?? daily?.sleepQuality) === "warning"
                        ? "Average"
                        : qualityTone(daily?.sleep_quality ?? daily?.sleepQuality) === "danger"
                          ? "Poor"
                          : "—"}
                  </span>
                }
              />
              <Card
                icon={Zap}
                title="Energy Score"
                value={daily?.energy_score ?? daily?.energyScore ?? "—"}
                subtitle="Overall readiness estimate"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
