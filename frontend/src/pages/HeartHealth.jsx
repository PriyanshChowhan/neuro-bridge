import { useEffect, useState } from "react";
import { Activity, Brain, Droplets } from "lucide-react";
import Nav from "../components/Nav";
import { api } from "../api/client";

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
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

const getStatusTone = ({ kind, value }) => {
  if (value == null || Number.isNaN(Number(value))) return "muted";
  const v = Number(value);
  if (kind === "heart_rate") {
    if (v >= 60 && v <= 100) return "success";
    if (v >= 50 && v <= 110) return "warning";
    return "danger";
  }
  if (kind === "spo2") {
    if (v >= 95 && v <= 100) return "success";
    if (v >= 93 && v <= 94) return "warning";
    return "danger";
  }
  if (kind === "stress_level") {
    if (v >= 0 && v <= 40) return "success";
    if (v >= 41 && v <= 60) return "warning";
    return "danger";
  }
  return "muted";
};

const toneToClasses = {
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  danger: "border-destructive/20 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

function StatCard({ icon: Icon, label, value, unit, tone }) {
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
        <span className={["rounded-full border px-2 py-0.5 text-xs font-medium", toneToClasses[tone || "muted"]].join(" ")}>
          {tone === "success" ? "Normal" : tone === "warning" ? "Mild" : tone === "danger" ? "High" : "—"}
        </span>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-4 shadow-health">
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="mt-4 space-y-3">
        <div className="h-8 w-full rounded bg-muted" />
        <div className="h-8 w-full rounded bg-muted" />
        <div className="h-8 w-full rounded bg-muted" />
      </div>
    </div>
  );
}

export default function HeartHealth() {
  const [latest, setLatest] = useState(null);
  const [series, setSeries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [l, all] = await Promise.all([api.get("/realtime/latest"), api.get("/realtime")]);
        if (cancelled) return;
        setLatest(l?.data?.data || null);
        setSeries(all?.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.error || err?.message || "Failed to load heart data");
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
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Heart Health</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest cardiovascular signals and recent readings.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Latest status</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {loading ? (
              <>
                <div className="h-[88px] animate-pulse rounded-lg border border-border bg-card shadow-health" />
                <div className="h-[88px] animate-pulse rounded-lg border border-border bg-card shadow-health" />
                <div className="h-[88px] animate-pulse rounded-lg border border-border bg-card shadow-health" />
              </>
            ) : (
              <>
                <StatCard
                  icon={Activity}
                  label="Heart Rate"
                  value={latest?.heart_rate ?? null}
                  unit="bpm"
                  tone={getStatusTone({ kind: "heart_rate", value: latest?.heart_rate })}
                />
                <StatCard
                  icon={Droplets}
                  label="SpO₂"
                  value={latest?.spo2 ?? null}
                  unit="%"
                  tone={getStatusTone({ kind: "spo2", value: latest?.spo2 })}
                />
                <StatCard
                  icon={Brain}
                  label="Stress Level"
                  value={latest?.stress_level ?? null}
                  tone={getStatusTone({ kind: "stress_level", value: latest?.stress_level })}
                />
              </>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Recent records</h2>
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-health">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">Heart Rate</th>
                      <th className="px-4 py-3 font-medium">SpO₂</th>
                      <th className="px-4 py-3 font-medium">Stress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(series || []).slice(0, 20).map((row, idx) => (
                      <tr key={row?._id || row?.timestamp || idx} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDateTime(row?.timestamp)}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {row?.heart_rate ?? "—"} {row?.heart_rate != null ? <span className="text-muted-foreground">bpm</span> : null}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {row?.spo2 ?? "—"} {row?.spo2 != null ? <span className="text-muted-foreground">%</span> : null}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {row?.stress_level ?? "—"}
                        </td>
                      </tr>
                    ))}
                    {(!series || series.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No recent readings available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
