import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, HeartPulse, User } from "lucide-react";
import Nav from "../components/Nav";
import { api } from "../api/client";

const inputClass =
  "mt-1 h-11 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70";

const textareaClass =
  "mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70";

function SectionCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-health">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SkeletonSection() {
  return (
    <section className="animate-pulse rounded-lg border border-border bg-card p-5 shadow-health">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-muted" />
        <div className="h-4 w-28 rounded bg-muted" />
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
      </div>
    </section>
  );
}

export default function Profile() {
  const userId = useMemo(() => localStorage.getItem("userId"), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    setError("");
    if (!userId) {
      setError("Your session has expired. Please sign in again.");
      return;
    }
    try {
      setBusy(true);
      const [u, p] = await Promise.all([
        api.get("/user/me", { params: { userId } }),
        api.get("/personal/me", { params: { userId } }),
      ]);
      setUser(u?.data?.data || null);
      setPersonal(p?.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to load profile");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setError("");
    if (!userId) return;
    try {
      setBusy(true);
      await Promise.all([
        api.put("/user/me", { userId, username: user?.username, emailId: user?.emailId }),
        api.put("/personal/me", { userId, ...personal }),
      ]);
      setEditing(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to save profile");
    } finally {
      setBusy(false);
    }
  };

  const onChangeUser = (field, value) => setUser((prev) => ({ ...(prev || {}), [field]: value }));
  const onChangePersonal = (field, value) =>
    setPersonal((prev) => ({ ...(prev || {}), [field]: value }));

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account and health profile details.
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-health transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setEditing(true)}
              disabled={busy}
            >
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setEditing(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-health transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={save}
                disabled={busy}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}{" "}
            {!userId ? (
              <Link to="/" className="font-medium text-primary hover:underline">
                Go to login
              </Link>
            ) : null}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {busy && !user && !personal ? (
            <>
              <SkeletonSection />
              <SkeletonSection />
              <SkeletonSection />
            </>
          ) : (
            <>
              <SectionCard icon={User} title="Account">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-muted-foreground">Name</span>
                    <input
                      className={inputClass}
                      value={user?.username || ""}
                      disabled={!editing}
                      onChange={(e) => onChangeUser("username", e.target.value)}
                      autoComplete="name"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-muted-foreground">Email</span>
                    <input
                      className={inputClass}
                      type="email"
                      value={user?.emailId || ""}
                      disabled={!editing}
                      onChange={(e) => onChangeUser("emailId", e.target.value)}
                      autoComplete="email"
                    />
                  </label>
                </div>
              </SectionCard>

              <SectionCard icon={HeartPulse} title="Personal Details">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-muted-foreground">Date of Birth</span>
                    <input
                      className={inputClass}
                      type="date"
                      value={personal?.dob ? new Date(personal.dob).toISOString().slice(0, 10) : ""}
                      disabled={!editing}
                      onChange={(e) => onChangePersonal("dob", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-muted-foreground">Gender</span>
                    <input
                      className={inputClass}
                      value={personal?.gender || ""}
                      disabled={!editing}
                      onChange={(e) => onChangePersonal("gender", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-muted-foreground">Address</span>
                    <input
                      className={inputClass}
                      value={personal?.address || ""}
                      disabled={!editing}
                      onChange={(e) => onChangePersonal("address", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-muted-foreground">
                      Emergency Contact
                    </span>
                    <input
                      className={inputClass}
                      value={personal?.emergencyContact || ""}
                      disabled={!editing}
                      onChange={(e) => onChangePersonal("emergencyContact", e.target.value)}
                    />
                  </label>
                </div>
              </SectionCard>

              <SectionCard icon={FileText} title="Medical History">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-muted-foreground">Medical History</span>
                    <textarea
                      className={textareaClass}
                      rows={4}
                      value={personal?.medicalHistory || ""}
                      disabled={!editing}
                      onChange={(e) => onChangePersonal("medicalHistory", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-muted-foreground">Family History</span>
                    <textarea
                      className={textareaClass}
                      rows={4}
                      value={personal?.familyHistory || ""}
                      disabled={!editing}
                      onChange={(e) => onChangePersonal("familyHistory", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-muted-foreground">Lifestyle</span>
                    <textarea
                      className={textareaClass}
                      rows={4}
                      value={personal?.lifestyle || ""}
                      disabled={!editing}
                      onChange={(e) => onChangePersonal("lifestyle", e.target.value)}
                    />
                  </label>
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

