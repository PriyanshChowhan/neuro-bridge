import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Brain,
  Droplets,
  Flame,
  Footprints,
  Moon,
  Zap,
} from "lucide-react";
import Nav from "../components/Nav";
import { api } from "../api/client";

const formatDateTime = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${date} · ${time}`;
};

const getStatus = ({ kind, value }) => {
  if (value == null || Number.isNaN(Number(value))) return { label: "—", tone: "muted" };
  const v = Number(value);

  if (kind === "heart_rate") {
    if (v >= 60 && v <= 100) return { label: "Normal", tone: "success" };
    if (v >= 50 && v <= 110) return { label: "Mild", tone: "warning" };
    return { label: "High", tone: "danger" };
  }
  if (kind === "spo2") {
    if (v >= 95 && v <= 100) return { label: "Normal", tone: "success" };
    if (v >= 93 && v <= 94) return { label: "Mild", tone: "warning" };
    return { label: "Low", tone: "danger" };
  }
  if (kind === "stress_level") {
    if (v >= 0 && v <= 40) return { label: "Normal", tone: "success" };
    if (v >= 41 && v <= 60) return { label: "Mild", tone: "warning" };
    return { label: "High", tone: "danger" };
  }
  return { label: "—", tone: "muted" };
};

const toneClasses = {
  success: {
    dot: "bg-success",
    badge: "border-success/20 bg-success/10 text-success",
  },
  warning: {
    dot: "bg-warning",
    badge: "border-warning/20 bg-warning/10 text-warning",
  },
  danger: {
    dot: "bg-destructive",
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  muted: {
    dot: "bg-muted-foreground/30",
    badge: "border-border bg-muted/50 text-muted-foreground",
  },
};

function MetricCard({ icon: Icon, label, value, unit, status }) {
  const tone = toneClasses[status?.tone || "muted"];
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-health">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">
              {value ?? "—"}
              {value != null && unit ? <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span> : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={["h-2.5 w-2.5 rounded-full", tone.dot].join(" ")} />
          <span className={["rounded-full border px-2 py-0.5 text-xs font-medium", tone.badge].join(" ")}>
            {status?.label || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-4 shadow-health">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-muted" />
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-6 w-32 rounded bg-muted" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [latestDaily, setLatestDaily] = useState(null);
  const [latestRealtime, setLatestRealtime] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async ({ initialLoad = false } = {}) => {
      if (initialLoad) setLoading(true);
      try {
        const [r, d] = await Promise.all([api.get("/realtime/latest"), api.get("/daily/latest")]);
        if (cancelled) return;
        setLatestRealtime(r?.data?.data || null);
        setLatestDaily(d?.data?.data || null);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        setError(err?.response?.data?.error || err?.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboardData({ initialLoad: true });
    const intervalId = setInterval(() => {
      if (!cancelled) {
        loadDashboardData();
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {lastUpdated ? `Last updated ${formatDateTime(lastUpdated)}` : "Overview of your latest health signals"}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {latestDaily?.username ? `Hello, ${latestDaily.username}` : null}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Realtime metrics</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading || (!latestRealtime && !error) ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <MetricCard
                  icon={Activity}
                  label="Heart Rate"
                  value={latestRealtime?.heart_rate ?? null}
                  unit="bpm"
                  status={getStatus({ kind: "heart_rate", value: latestRealtime?.heart_rate })}
                />
                <MetricCard
                  icon={Droplets}
                  label="SpO₂"
                  value={latestRealtime?.spo2 ?? null}
                  unit="%"
                  status={getStatus({ kind: "spo2", value: latestRealtime?.spo2 })}
                />
                <MetricCard
                  icon={Brain}
                  label="Stress Level"
                  value={latestRealtime?.stress_level ?? null}
                  status={getStatus({ kind: "stress_level", value: latestRealtime?.stress_level })}
                />
                <MetricCard
                  icon={Footprints}
                  label="Steps"
                  value={latestRealtime?.steps ?? null}
                  status={{ label: latestRealtime?.steps != null ? "Today" : "—", tone: "muted" }}
                />
                <MetricCard
                  icon={Flame}
                  label="Calories Burned"
                  value={latestRealtime?.calories_burned ?? null}
                  unit="kcal"
                  status={{ label: latestRealtime?.calories_burned != null ? "Today" : "—", tone: "muted" }}
                />
              </>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Daily metrics</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading || (!latestDaily && !error) ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <MetricCard
                  icon={Moon}
                  label="Sleep"
                  value={latestDaily?.sleep_duration ?? latestDaily?.sleepDuration ?? null}
                  unit="hrs"
                  status={{
                    label: (latestDaily?.sleep_quality ?? latestDaily?.sleepQuality ?? "—")?.toString(),
                    tone:
                      (latestDaily?.sleep_quality ?? latestDaily?.sleepQuality) === "good"
                        ? "success"
                        : (latestDaily?.sleep_quality ?? latestDaily?.sleepQuality) === "average"
                          ? "warning"
                          : (latestDaily?.sleep_quality ?? latestDaily?.sleepQuality) === "poor"
                            ? "danger"
                            : "muted",
                  }}
                />
                <MetricCard
                  icon={Zap}
                  label="Energy Score"
                  value={latestDaily?.energy_score ?? latestDaily?.energyScore ?? null}
                  status={{ label: latestDaily?.energy_score != null || latestDaily?.energyScore != null ? "Daily" : "—", tone: "muted" }}
                />
                <MetricCard
                  icon={Droplets}
                  label="Water Intake"
                  value={latestDaily?.water_intake ?? latestDaily?.waterIntake ?? null}
                  unit="ml"
                  status={{ label: latestDaily?.water_intake != null || latestDaily?.waterIntake != null ? "Daily" : "—", tone: "muted" }}
                />
                <MetricCard
                  icon={Flame}
                  label="Nutrition Calories"
                  value={latestDaily?.nutrition_calories ?? latestDaily?.nutritionCalories ?? latestDaily?.calories ?? null}
                  unit="kcal"
                  status={{ label: latestDaily?.nutrition_calories != null ? "Daily" : "—", tone: "muted" }}
                />
              </>
            )}
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-border bg-card p-5 shadow-health">
          <h2 className="text-sm font-semibold text-foreground">Quick links</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-health transition hover:bg-primary/90"
            >
              View profile
            </Link>
            <Link
              to="/heart-health"
              className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
            >
              Heart health
            </Link>
            <Link
              to="/mental-health"
              className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
            >
              Mental health
            </Link>
            <Link
              to="/test"
              className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
            >
              System test
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
