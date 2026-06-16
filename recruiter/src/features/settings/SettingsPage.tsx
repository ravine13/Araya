import { useState } from "react";
import { Edit3, ShieldCheck, Check } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { VerifiedBadge } from "@/components/brand/VerifiedBadge";
import { saveHospitalProfile, type HospitalProfile } from "@/lib/recruiterData";
import { getUser } from "@/store/authStore";
import { Route } from "@/routes/_app.settings";

const EMPTY: HospitalProfile = {
  id: "",
  name: "",
  shortName: "",
  type: "",
  city: "",
  state: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  registrationNumber: "",
  beds: null,
  founded: null,
  about: "",
  specialties: [],
  verified: false,
  profileComplete: false,
};

export function SettingsPage() {
  const user = getUser();
  const { hospital: loaded } = Route.useLoaderData();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<HospitalProfile>(() => (loaded ? { ...EMPTY, ...loaded } : EMPTY));

  const set = <K extends keyof HospitalProfile>(k: K, v: HospitalProfile[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    try {
      const updated = await saveHospitalProfile({
        name: form.name,
        shortName: form.shortName,
        type: form.type,
        city: form.city,
        state: form.state,
        address: form.address,
        phone: form.phone,
        email: form.email,
        website: form.website,
        registrationNumber: form.registrationNumber,
        beds: form.beds,
        founded: form.founded,
        about: form.about,
        specialties: form.specialties,
      });
      setForm(updated);
      setEditing(false);
      toast.success("Hospital profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
    }
  };

  const initials = (form.shortName || form.name || "HP").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-tight">
            Hospital profile & settings
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Manage your recruiter workspace, verification and team.
          </p>
          {!form.profileComplete && (
            <p className="mt-2 text-[13px] text-amber-800">
              Complete your hospital profile before posting jobs.{" "}
              <button type="button" className="underline" onClick={() => setEditing(true)}>
                Fill details now
              </button>
            </p>
          )}
        </div>
        <Button
          variant={editing ? "default" : "outline"}
          onClick={() => {
            if (editing) void save();
            else setEditing(true);
          }}
        >
          {editing ? (
            <>
              <Check className="mr-1.5 h-4 w-4" /> Save changes
            </>
          ) : (
            <>
              <Edit3 className="mr-1.5 h-4 w-4" /> Edit profile
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Hospital profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="notif">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5 space-y-5">
          <Card className="border-border bg-card shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-[18px] font-semibold">
                  {initials}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-[20px] font-semibold">{form.name || "Your hospital"}</h2>
                    {form.verified && <VerifiedBadge label="Verified Hospital" size="md" />}
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {form.type || "—"} · {form.city || "—"}, {form.state || "—"}
                    {form.beds ? ` · ${form.beds} beds` : ""}
                  </div>
                </div>
              </div>
              {form.about && (
                <p className="mt-4 text-[13.5px] leading-relaxed text-foreground/85">{form.about}</p>
              )}
              {form.specialties.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {form.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11.5px] text-foreground/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-soft">
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <Field label="Hospital name">
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  disabled={!editing}
                  className="h-11"
                />
              </Field>
              <Field label="Hospital type">
                <Input
                  value={form.type || ""}
                  onChange={(e) => set("type", e.target.value)}
                  disabled={!editing}
                  className="h-11"
                  placeholder="Multispeciality Hospital"
                />
              </Field>
              <Field label="Registration number">
                <Input
                  value={form.registrationNumber || ""}
                  onChange={(e) => set("registrationNumber", e.target.value)}
                  disabled={!editing}
                  className="h-11"
                />
              </Field>
              <Field label="City">
                <Input
                  value={form.city || ""}
                  onChange={(e) => set("city", e.target.value)}
                  disabled={!editing}
                  className="h-11"
                />
              </Field>
              <Field label="State">
                <Input
                  value={form.state || ""}
                  onChange={(e) => set("state", e.target.value)}
                  disabled={!editing}
                  className="h-11"
                />
              </Field>
              <Field label="Beds">
                <Input
                  type="number"
                  value={form.beds ?? ""}
                  onChange={(e) => set("beds", e.target.value ? Number(e.target.value) : null)}
                  disabled={!editing}
                  className="h-11"
                />
              </Field>
              <Field label="Address" className="md:col-span-2">
                <Input
                  value={form.address || ""}
                  onChange={(e) => set("address", e.target.value)}
                  disabled={!editing}
                  className="h-11"
                />
              </Field>
              <Field label="Website">
                <Input
                  value={form.website || ""}
                  onChange={(e) => set("website", e.target.value)}
                  disabled={!editing}
                  className="h-11"
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={form.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                  disabled={!editing}
                  className="h-11"
                />
              </Field>
              <Field label="Recruitment email">
                <Input
                  value={form.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                  disabled={!editing}
                  className="h-11"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="About">
                  <Textarea
                    value={form.about || ""}
                    onChange={(e) => set("about", e.target.value)}
                    disabled={!editing}
                    rows={4}
                  />
                </Field>
              </div>
              <div className="md:col-span-2 text-[12px] text-muted-foreground">
                Signed in as <span className="text-foreground">{user?.name}</span> ({user?.email})
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-5">
          <Card className="border-border bg-card shadow-soft">
            <CardContent className="p-6 text-[13px] text-muted-foreground">
              Team management is coming soon. Your account owner is {user?.name || "—"}.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="mt-5 space-y-4">
          <Card className="border-accent/20 bg-accent/[0.05] shadow-soft">
            <CardContent className="flex items-start gap-4 p-6">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-accent-foreground">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="font-display text-[16px] font-semibold">
                  {form.verified ? "Verified Hospital" : "Verification pending"}
                </div>
                <p className="text-[13px] text-muted-foreground">
                  {form.verified
                    ? `Verified on ${form.verifiedOn || "—"} by ${form.verifiedBy || "ApronHanger"}.`
                    : "Complete your profile and upload documents during onboarding to get verified."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notif" className="mt-5">
          <Card className="border-border bg-card shadow-soft">
            <CardContent className="space-y-4 p-6">
              {[
                "Email me when a new candidate applies",
                "Email me weekly hiring summary",
                "Notify me of high-match candidates (>90%)",
              ].map((label, i) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[13.5px]">{label}</span>
                  <Switch defaultChecked={i !== 1} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-[12.5px]">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
