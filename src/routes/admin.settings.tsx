import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell, AdminPanel } from "@/components/admin/shell";
import { DataTable, btnCls, inputCls } from "@/components/admin/table";
import { getSettings, updateSetting, updateSocialLink } from "@/lib/platform.functions";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Hadees Trading Control Centre" },
      { name: "description", content: "Manage company details, billing preferences, social links and staff roles without touching code." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
});

const GROUPS: { key: string; label: string; fields: string[] }[] = [
  { key: "company", label: "Company information", fields: ["legal_name", "trading_name", "registration_number", "vat_number", "address", "operating_hours"] },
  { key: "contact", label: "Contact channels", fields: ["email", "billing_email", "support_email", "phone", "whatsapp"] },
  { key: "billing", label: "Billing & VAT", fields: ["vat_rate", "invoice_prefix", "quote_prefix", "receipt_prefix", "payment_terms"] },
  { key: "website", label: "Website settings", fields: ["tagline", "hero_headline", "booking_url", "brand_logo_url"] },
];

function SettingsPage() {
  const qc = useQueryClient();
  const fetchSettings = useServerFn(getSettings);
  const saveSetting = useServerFn(updateSetting);
  const saveSocial = useServerFn(updateSocialLink);

  const q = useQuery({ queryKey: ["admin", "settings"], queryFn: () => fetchSettings({}) });
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "settings"] });

  const mSetting = useMutation({
    mutationFn: (v: { key: string; value: Record<string, unknown>; is_public: boolean }) => saveSetting({ data: v }),
    onSuccess: invalidate,
  });
  const mSocial = useMutation({
    mutationFn: (v: { platform: string; url: string; enabled: boolean }) => saveSocial({ data: v }),
    onSuccess: invalidate,
  });

  const valueFor = (key: string) =>
    (q.data?.settings.find((s) => s.key === key)?.value ?? {}) as Record<string, string>;

  return (
    <AdminShell title="Settings" subtitle="Company, billing, website and access configuration — no code required.">
      {GROUPS.map((g) => (
        <SettingGroup key={g.key} group={g} current={valueFor(g.key)} pending={mSetting.isPending}
          onSave={(value) => mSetting.mutate({ key: g.key, value, is_public: g.key !== "billing" })} />
      ))}

      <AdminPanel title="Social media links">
        <div className="grid gap-2">
          {(q.data?.socials ?? []).map((s) => (
            <SocialRow key={s.id} platform={s.platform} url={s.url} enabled={s.enabled}
              onSave={(url, enabled) => mSocial.mutate({ platform: s.platform, url, enabled })} />
          ))}
          {(q.data?.socials ?? []).length === 0 && <p className="text-xs text-muted-foreground">No social links configured yet.</p>}
        </div>
      </AdminPanel>

      <AdminPanel title="Team & roles">
        <DataTable
          rows={q.data?.users ?? []}
          empty="No users yet."
          cols={[
            { key: "n", label: "Name", render: (u) => <span className="font-medium">{u.full_name || "—"}</span> },
            { key: "e", label: "Email", render: (u) => <span className="text-xs">{u.email}</span> },
            { key: "r", label: "Roles", render: (u) => <span className="text-xs capitalize">{u.roles.join(", ").replace(/_/g, " ") || "client"}</span> },
          ]}
        />
      </AdminPanel>
    </AdminShell>
  );
}

function SettingGroup({ group, current, onSave, pending }: {
  group: { key: string; label: string; fields: string[] };
  current: Record<string, string>;
  onSave: (v: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const [form, setForm] = useState<Record<string, string>>({});
  const value = (f: string) => form[f] ?? current[f] ?? "";
  return (
    <AdminPanel title={group.label}>
      <form className="grid gap-3 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); onSave({ ...current, ...form }); }}>
        {group.fields.map((f) => (
          <label key={f} className="grid gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{f.replace(/_/g, " ")}</span>
            <input className={inputCls} value={value(f)} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
          </label>
        ))}
        <div className="sm:col-span-3"><button className={btnCls} disabled={pending}>Save {group.label.toLowerCase()}</button></div>
      </form>
    </AdminPanel>
  );
}

function SocialRow({ platform, url, enabled, onSave }: { platform: string; url: string; enabled: boolean; onSave: (url: string, enabled: boolean) => void }) {
  const [u, setU] = useState(url);
  const [on, setOn] = useState(enabled);
  return (
    <div className="grid gap-2 sm:grid-cols-[120px_1fr_auto_auto] sm:items-center">
      <span className="text-xs capitalize text-muted-foreground">{platform}</span>
      <input className={inputCls} value={u} onChange={(e) => setU(e.target.value)} />
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} /> Enabled
      </label>
      <button className={btnCls} onClick={() => onSave(u, on)}>Save</button>
    </div>
  );
}
