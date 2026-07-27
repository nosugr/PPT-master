"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  settings,
  type SettingsSchema,
  type SettingsData,
} from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Check,
  Zap,
  Loader2,
  BookOpen,
  Wrench,
  ArrowLeft,
  Activity,
  HardDrive,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formats, type CanvasFormat } from "@/lib/api";

const PROVIDER_KEY_URLS: Record<string, string> = {
  DeepSeek: "https://platform.deepseek.com/api_keys",
  OpenAI: "https://platform.openai.com/api-keys",
  Qwen: "https://dashscope.console.aliyun.com/apiKey",
  Gemini: "https://aistudio.google.com/app/apikey",
  MiMo: "https://platform.xiaomi.ai/",
  Volcengine: "https://www.volcengine.com/experience/ark",
  ElevenLabs: "https://elevenlabs.io/app/settings/api-keys",
  MiniMax: "https://www.minimaxi.com/user-center/basic-information/interface-key",
  Pexels: "https://www.pexels.com/api/",
  Pixabay: "https://pixabay.com/api/docs/",
};

// Category display - keys for i18n
const CAT_KEYS: Record<string, { labelKey: string; descKey: string; required?: boolean }> = {
  llm: { labelKey: "settings.catLlm", descKey: "settings.catLlmDesc", required: true },
  image: { labelKey: "settings.catImage", descKey: "settings.catImageDesc" },
  tts: { labelKey: "settings.catTts", descKey: "settings.catTtsDesc" },
  search: { labelKey: "settings.catSearch", descKey: "settings.catSearchDesc" },
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function PasswordInput({
  id,
  value,
  placeholder,
  onChange,
  onFocus,
}: {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex gap-1.5">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="flex-1 font-mono text-sm"
      />
      <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => setVisible(!visible)}>
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}

function DocsTab({ t }: { t: (key: any, params?: any) => string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">{t("settings.docsTitle")}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("settings.docsIntro")}
        </p>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-3 pb-2 border-b">{t("settings.docsLlmTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t("settings.docsLlmDesc")} <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">chat/completions</code>
        </p>
        <div className="border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium w-36">{t("settings.docsParam")}</th>
                <th className="text-left px-4 py-2.5 font-medium">{t("settings.docsValue")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">BASE_URL</td>
                <td className="px-4 py-2.5 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono">https://api.deepseek.com/v1</code>
                    <span className="text-muted-foreground">(DeepSeek)</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono">https://api.openai.com/v1</code>
                    <span className="text-muted-foreground">(OpenAI)</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono">https://dashscope.aliyuncs.com/compatible-mode/v1</code>
                    <span className="text-muted-foreground">(Qwen)</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">API_KEY</td>
                <td className="px-4 py-2.5 text-xs space-y-1">
                  <div><a href={PROVIDER_KEY_URLS.DeepSeek} target="_blank" rel="noreferrer" className="text-primary hover:underline">DeepSeek Platform</a></div>
                  <div><a href={PROVIDER_KEY_URLS.OpenAI} target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenAI Platform</a></div>
                  <div><a href={PROVIDER_KEY_URLS.Qwen} target="_blank" rel="noreferrer" className="text-primary hover:underline">Alibaba DashScope</a></div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">MODEL</td>
                <td className="px-4 py-2.5 text-xs space-y-1">
                  <div><code className="bg-muted px-1.5 py-0.5 rounded font-mono">deepseek-chat</code> <span className="text-muted-foreground">({t("settings.docsRecommended")})</span></div>
                  <div><code className="bg-muted px-1.5 py-0.5 rounded font-mono">gpt-4o</code></div>
                  <div><code className="bg-muted px-1.5 py-0.5 rounded font-mono">qwen-plus</code></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-muted/50 border rounded-lg p-4 text-xs font-mono leading-relaxed">
          <p className="text-muted-foreground mb-1"># .env</p>
          <p>LLM_API_KEY=sk-xxxxxxxxxxxxxxxx</p>
          <p>LLM_BASE_URL=https://api.deepseek.com/v1</p>
          <p>LLM_MODEL=deepseek-chat</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 pb-2 border-b">{t("settings.docsImageTitle")} <span className="text-sm font-normal text-muted-foreground ml-2">{t("settings.docsImageOptional")}</span></h2>
        <p className="text-sm text-muted-foreground mb-3">{t("settings.docsImageDesc")}</p>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="text-left px-4 py-2 font-medium w-36">{t("settings.docsProvider")}</th><th className="text-left px-4 py-2 font-medium">{t("settings.docsDescription")}</th></tr></thead>
            <tbody className="divide-y text-xs">
              <tr><td className="px-4 py-2"><a href={PROVIDER_KEY_URLS.MiMo} target="_blank" rel="noreferrer" className="text-primary hover:underline">MiMo</a></td><td className="px-4 py-2 text-muted-foreground">Xiaomi vision model</td></tr>
              <tr><td className="px-4 py-2"><a href={PROVIDER_KEY_URLS.Gemini} target="_blank" rel="noreferrer" className="text-primary hover:underline">Gemini</a></td><td className="px-4 py-2 text-muted-foreground">Google multimodal</td></tr>
              <tr><td className="px-4 py-2"><a href={PROVIDER_KEY_URLS.OpenAI} target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenAI</a></td><td className="px-4 py-2 text-muted-foreground">DALL-E / GPT-Image</td></tr>
              <tr><td className="px-4 py-2"><a href={PROVIDER_KEY_URLS.Qwen} target="_blank" rel="noreferrer" className="text-primary hover:underline">Qwen</a></td><td className="px-4 py-2 text-muted-foreground">Alibaba DashScope</td></tr>
              <tr><td className="px-4 py-2"><a href={PROVIDER_KEY_URLS.Volcengine} target="_blank" rel="noreferrer" className="text-primary hover:underline">Volcengine</a></td><td className="px-4 py-2 text-muted-foreground">ByteDance Seedream</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 pb-2 border-b">{t("settings.docsTtsTitle")} <span className="text-sm font-normal text-muted-foreground ml-2">{t("settings.docsImageOptional")}</span></h2>
        <p className="text-sm text-muted-foreground mb-4">{t("settings.docsTtsDesc")}</p>
        <div className="border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="text-left px-4 py-2 font-medium w-36">{t("settings.docsProvider")}</th><th className="text-left px-4 py-2 font-medium">{t("settings.docsDescription")}</th><th className="text-left px-4 py-2 font-medium w-28">{t("settings.docsNeedsKey")}</th></tr></thead>
            <tbody className="divide-y text-xs">
              <tr><td className="px-4 py-2">Edge TTS</td><td className="px-4 py-2 text-muted-foreground">Microsoft free TTS, default</td><td className="px-4 py-2 text-green-600">{t("settings.docsNo")}</td></tr>
              <tr><td className="px-4 py-2">ElevenLabs</td><td className="px-4 py-2 text-muted-foreground">High-quality AI voice, cloning</td><td className="px-4 py-2"><a href={PROVIDER_KEY_URLS.ElevenLabs} target="_blank" rel="noreferrer" className="text-primary hover:underline">{t("settings.getKey")}</a></td></tr>
              <tr><td className="px-4 py-2">MiniMax</td><td className="px-4 py-2 text-muted-foreground">MiniMax TTS</td><td className="px-4 py-2"><a href={PROVIDER_KEY_URLS.MiniMax} target="_blank" rel="noreferrer" className="text-primary hover:underline">{t("settings.getKey")}</a></td></tr>
            </tbody>
          </table>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs">
          <p>{t("settings.docsTtsTip")}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 pb-2 border-b">{t("settings.docsSearchTitle")} <span className="text-sm font-normal text-muted-foreground ml-2">{t("settings.docsImageOptional")}</span></h2>
        <p className="text-sm text-muted-foreground mb-4">{t("settings.docsSearchDesc")}</p>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="text-left px-4 py-2 font-medium w-36">{t("settings.docsProvider")}</th><th className="text-left px-4 py-2 font-medium">{t("settings.docsDescription")}</th><th className="text-left px-4 py-2 font-medium w-28">{t("settings.docsNeedsKey")}</th></tr></thead>
            <tbody className="divide-y text-xs">
              <tr><td className="px-4 py-2">Pexels</td><td className="px-4 py-2 text-muted-foreground">High-quality free stock photos</td><td className="px-4 py-2"><a href={PROVIDER_KEY_URLS.Pexels} target="_blank" rel="noreferrer" className="text-primary hover:underline">{t("settings.getKey")}</a></td></tr>
              <tr><td className="px-4 py-2">Pixabay</td><td className="px-4 py-2 text-muted-foreground">Free images and media</td><td className="px-4 py-2"><a href={PROVIDER_KEY_URLS.Pixabay} target="_blank" rel="noreferrer" className="text-primary hover:underline">{t("settings.getKey")}</a></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { t } = useTranslation();
  const [schema, setSchema] = useState<SettingsSchema | null>(null);
  const [data, setData] = useState<SettingsData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [selectors, setSelectors] = useState<Record<string, string>>({});
  const [dirtySelectors, setDirtySelectors] = useState<Set<string>>(new Set());
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testState, setTestState] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    Promise.all([settings.schema(), settings.get()])
      .then(([s, d]) => {
        setSchema(s);
        setData(d);
        setFormValues(d.values || {});
        setSelectors({
          IMAGE_BACKEND: d.image_backend || "",
          TTS_PROVIDER: d.tts_provider || "",
          LLM_PROVIDER: d.llm_provider || "",
        });
      })
      .catch(() => toast.error(t("settings.loadFailed")))
      .finally(() => setLoading(false));
  }, [t]);

  const handleFieldChange = useCallback((key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setDirtyFields((prev) => new Set(prev).add(key));
  }, []);

  const handleSetActive = useCallback(
    (providerId: string) => {
      if (!schema) return;
      const p = schema.providers[providerId];
      if (!p || !p.env_key) return;
      setSelectors((prev) => ({ ...prev, [p.env_key!]: p.env_value || providerId }));
      setDirtySelectors((prev) => new Set(prev).add(p.env_key!));
    },
    [schema]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const selPayload: Record<string, string> = {};
      for (const k of dirtySelectors) selPayload[k] = selectors[k] || "";
      const valPayload: Record<string, string> = {};
      for (const k of dirtyFields) valPayload[k] = formValues[k] || "";

      await settings.update({ selectors: selPayload, values: valPayload });
      toast.success(t("settings.saved"));
      setDirtyFields(new Set());
      setDirtySelectors(new Set());
      setTestState("idle");
      setTestMessage("");

      const fresh = await settings.get();
      setData(fresh);
      setFormValues(fresh.values || {});
      setSelectors({
        IMAGE_BACKEND: fresh.image_backend || "",
        TTS_PROVIDER: fresh.tts_provider || "",
        LLM_PROVIDER: fresh.llm_provider || "",
      });
    } catch {
      toast.error(t("settings.saveFailed"));
    } finally {
      setSaving(false);
    }
  }, [dirtySelectors, dirtyFields, selectors, formValues, t]);

  const handleTestConnection = useCallback(async () => {
    setTestState("testing");
    setTestMessage("");
    try {
      const result = await settings.test();
      setTestState("ok");
      setTestMessage(result.model || "");
    } catch (e: any) {
      setTestState("error");
      setTestMessage(e.message || "");
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!schema || !data) {
    return <div className="py-20 text-center text-muted-foreground">{t("settings.loadFailed")}</div>;
  }

  const rawVals = data.raw_values || formValues;

  const getIsActive = (providerId: string) => {
    const p = schema.providers[providerId];
    if (!p || !p.env_key) return false;
    return selectors[p.env_key] === (p.env_value || providerId);
  };

  const getIsConfigured = (providerId: string) => {
    const p = schema.providers[providerId];
    if (!p) return false;
    // If this provider belongs to a selector group, only show checkmark when active
    if (p.env_key) {
      return getIsActive(providerId);
    }
    // For providers without a selector (like search providers), check fields directly
    return p.fields.some((f) => f.required && rawVals[f.key]);
  };

  // Provider detail view
  if (selectedProvider && schema.providers[selectedProvider]) {
    const provider = schema.providers[selectedProvider];
    const isActive = getIsActive(selectedProvider);

    // Build current config JSON for display
    const configJson: Record<string, string> = {};
    for (const field of provider.fields) {
      const val = formValues[field.key];
      if (val && !/^\*{4,}/.test(val)) {
        configJson[field.key] = field.type === "password" ? "***" : val;
      } else if (field.default) {
        configJson[field.key] = field.default;
      }
    }
    if (provider.env_key) {
      configJson[provider.env_key] = provider.env_value || selectedProvider;
    }

    return (
      <div>
        <button
          onClick={() => setSelectedProvider(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" /> {t("settings.backToList")}
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{provider.name}</h1>
            <p className="text-sm text-muted-foreground">{provider.description}</p>
          </div>
          {provider.env_key && (
            isActive ? (
              <Badge className="gap-1"><Check className="size-3" /> {t("settings.active")}</Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={() => handleSetActive(selectedProvider)}>
                {t("settings.setActive")}
              </Button>
            )
          )}
        </div>

        <Separator className="mb-6" />

        {provider.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("settings.noConfigNeeded")}</p>
        ) : (
          <div className="space-y-5">
            {provider.fields.map((field) => {
              // Only pre-fill from saved .env values when this provider is currently active.
              // Non-active providers start with empty fields so users aren't confused by
              // another provider's key appearing in the form.
              const displayVal = (!isActive && !dirtyFields.has(field.key))
                ? ""
                : (formValues[field.key] || "");
              return (
                <div key={field.key}>
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </Label>
                  {field.type === "password" ? (
                    <div className="mt-1.5">
                      <PasswordInput
                        id={field.key}
                        value={displayVal}
                        placeholder={field.default || ""}
                        onChange={(v) => handleFieldChange(field.key, v)}
                        onFocus={() => {
                          if (/^\*{4,}/.test(formValues[field.key] || "")) handleFieldChange(field.key, "");
                        }}
                      />
                    </div>
                  ) : (
                    <Input
                      id={field.key}
                      value={displayVal}
                      placeholder={field.default || t("settings.baseUrlPlaceholder")}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="mt-1.5 font-mono text-sm"
                    />
                  )}
                </div>
              );
            })}

            <div className="pt-4">
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <><Loader2 className="size-4 mr-2 animate-spin" /> {t("settings.saving")}</> : t("settings.save")}
              </Button>
            </div>
          </div>
        )}

        {/* Config JSON preview */}
        <Separator className="my-6" />
        <div>
          <h3 className="text-sm font-medium mb-2">{t("settings.configJson")}</h3>
          <div className="bg-muted/50 border rounded-lg p-4 font-mono text-xs leading-relaxed overflow-auto">
            <pre>{JSON.stringify(configJson, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  // Category list view
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="size-5" />
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
      </div>

      <Tabs defaultValue="docs">
        <TabsList className="mb-4">
          <TabsTrigger value="docs" className="gap-1.5">
            <BookOpen className="size-3.5" /> {t("settings.tabDocs")}
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5">
            <Wrench className="size-3.5" /> {t("settings.tabConfig")}
          </TabsTrigger>
          <TabsTrigger value="prefs" className="gap-1.5">
            <Sliders className="size-3.5" /> {t("settings.prefTitle")}
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5">
            <HardDrive className="size-3.5" /> {t("settings.sysTitle")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="docs">
          <DocsTab t={t} />
        </TabsContent>

        <TabsContent value="config" className="space-y-3">
          {schema.categories.map((cat) => {
            const catKey = CAT_KEYS[cat.id];
            if (!catKey) return null;

            return (
              <div key={cat.id} className="border rounded-lg">
                {/* Category header */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{t(catKey.labelKey as any)}</span>
                      {catKey.required && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t("settings.required")}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{t(catKey.descKey as any)}</p>
                  </div>
                  {/* Test connection — for llm, image, tts when a key is saved */}
                  {(cat.id === "llm" && rawVals["LLM_API_KEY"]) ||
                   (cat.id === "image" && cat.providers.some(pid => getIsActive(pid) && getIsConfigured(pid))) ||
                   (cat.id === "tts" && cat.providers.some(pid => getIsActive(pid) && getIsConfigured(pid))) ? (
                    <div className="flex items-center gap-2 shrink-0">
                      {testState === "ok" && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="size-3" /> {t("settings.testOk")}
                          {testMessage && <span className="text-muted-foreground ml-0.5">({testMessage})</span>}
                        </span>
                      )}
                      {testState === "error" && (
                        <span className="text-xs text-red-500 max-w-[180px] truncate" title={testMessage}>
                          {t("settings.testFailed")}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={handleTestConnection}
                        disabled={testState === "testing"}
                      >
                        {testState === "testing"
                          ? <><Loader2 className="size-3 mr-1 animate-spin" />{t("settings.testing")}</>
                          : <><Activity className="size-3 mr-1" />{t("settings.testConnection")}</>
                        }
                      </Button>
                    </div>
                  ) : null}
                </div>

                {/* Provider list */}
                <div className="border-t px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {cat.providers.map((pid) => {
                      const p = schema.providers[pid];
                      if (!p) return null;
                      const isActive = getIsActive(pid);
                      const isConfigured = getIsConfigured(pid);

                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => setSelectedProvider(pid)}
                          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-all cursor-pointer hover:bg-accent/50 ${
                            isActive ? "border-primary bg-primary/5 font-medium" : "border-muted"
                          }`}
                        >
                          {p.name}
                          {isActive && <Check className="size-3 text-primary" />}
                          {isConfigured && !isActive && <Check className="size-3 text-green-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* LLM advanced: Strategist/Executor model overrides */}
                {cat.id === "llm" && rawVals["LLM_API_KEY"] && (
                  <div className="border-t px-4 py-3">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => {
                        const el = document.getElementById("llm-advanced-fields");
                        if (el) el.classList.toggle("hidden");
                      }}
                    >
                      <span className="flex items-center gap-1.5">
                        <Sliders className="size-3" /> {t("settings.roleModelTitle")}
                      </span>
                      <span className="text-[10px]">{t("settings.roleModelHint")}</span>
                    </button>
                    <div id="llm-advanced-fields" className="hidden mt-3 space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {t("settings.roleModelDesc")}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="LLM_STRATEGIST_MODEL" className="text-xs font-medium">
                            {t("settings.strategistModel")}
                          </Label>
                          <Input
                            id="LLM_STRATEGIST_MODEL"
                            value={(!dirtyFields.has("LLM_STRATEGIST_MODEL") && !formValues["LLM_STRATEGIST_MODEL"]) ? "" : (formValues["LLM_STRATEGIST_MODEL"] || "")}
                            placeholder={t("settings.useMainModel")}
                            onChange={(e) => handleFieldChange("LLM_STRATEGIST_MODEL", e.target.value)}
                            className="mt-1 font-mono text-sm h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="LLM_EXECUTOR_MODEL" className="text-xs font-medium">
                            {t("settings.executorModel")}
                          </Label>
                          <Input
                            id="LLM_EXECUTOR_MODEL"
                            value={(!dirtyFields.has("LLM_EXECUTOR_MODEL") && !formValues["LLM_EXECUTOR_MODEL"]) ? "" : (formValues["LLM_EXECUTOR_MODEL"] || "")}
                            placeholder={t("settings.useMainModel")}
                            onChange={(e) => handleFieldChange("LLM_EXECUTOR_MODEL", e.target.value)}
                            className="mt-1 font-mono text-sm h-8"
                          />
                        </div>
                      </div>
                      <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <><Loader2 className="size-3 mr-1 animate-spin" /> {t("settings.savingRoleModel")}</> : t("settings.saveRoleModel")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="prefs">
          <PrefsTab t={t} />
        </TabsContent>

        <TabsContent value="system">
          <SystemTab t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preferences tab
// ---------------------------------------------------------------------------

function PrefsTab({ t }: { t: (key: any, params?: any) => string }) {
  const [formatList, setFormatList] = useState<CanvasFormat[]>([]);
  const [defaultPages, setDefaultPages] = useState(() => {
    try { return localStorage.getItem("pptmaster.pref.defaultPages") || ""; } catch { return ""; }
  });
  const [defaultFormat, setDefaultFormat] = useState(() => {
    try { return localStorage.getItem("pptmaster.pref.defaultFormat") || "ppt169"; } catch { return "ppt169"; }
  });
  const [defaultImageMode, setDefaultImageMode] = useState(() => {
    try { return localStorage.getItem("pptmaster.pref.defaultImageMode") || "filtered"; } catch { return "filtered"; }
  });
  const { toast: toastFn } = { toast: (msg: any) => {} }; // use sonner directly

  useEffect(() => {
    formats.list().then(setFormatList).catch(() => {});
  }, []);

  const save = () => {
    try {
      localStorage.setItem("pptmaster.pref.defaultPages", defaultPages);
      localStorage.setItem("pptmaster.pref.defaultFormat", defaultFormat);
      localStorage.setItem("pptmaster.pref.defaultImageMode", defaultImageMode);
      // Also update the generate options cache
      const existing = JSON.parse(localStorage.getItem("pptmaster.generate.options") || "{}");
      localStorage.setItem("pptmaster.generate.options", JSON.stringify({
        ...existing,
        pageCount: defaultPages || undefined,
        imageMode: defaultImageMode,
      }));
    } catch {}
    import("sonner").then(({ toast }) => toast.success(t("settings.prefSaved")));
  };

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <Label className="text-sm font-medium">{t("settings.prefDefaultPages")}</Label>
        <input
          type="number"
          min={1}
          max={50}
          value={defaultPages}
          onChange={(e) => setDefaultPages(e.target.value)}
          placeholder="Auto"
          className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <Label className="text-sm font-medium">{t("settings.prefDefaultFormat")}</Label>
        <Select value={defaultFormat} onValueChange={(v) => { if (v) setDefaultFormat(v); }}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {formatList.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name} <span className="text-muted-foreground text-xs ml-1">{f.dimensions}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">{t("settings.prefDefaultImageMode")}</Label>
        <Select value={defaultImageMode} onValueChange={(v) => { if (v) setDefaultImageMode(v); }}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("generate.imageModeAll")}</SelectItem>
            <SelectItem value="filtered">{t("generate.imageModeFiltered")}</SelectItem>
            <SelectItem value="none">{t("generate.imageModeNone")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={save}>{t("settings.save")}</Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// System info + danger zone tab
// ---------------------------------------------------------------------------

function SystemTab({ t }: { t: (key: any, params?: any) => string }) {
  const [sysInfo, setSysInfo] = useState<{
    python_version: string;
    projects_dir: string;
    default_export_path: string;
    disk_usage_bytes: number;
    disk_usage_human: string;
  } | null>(null);
  const [sysLoading, setSysLoading] = useState(true);
  const [clearInput, setClearInput] = useState("");
  const [resetInput, setResetInput] = useState("");
  const [clearing, setClearing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [exportPath, setExportPath] = useState("");
  const [exportPathDirty, setExportPathDirty] = useState(false);
  const [exportPathSaving, setExportPathSaving] = useState(false);

  useEffect(() => {
    settings.systemInfo().then((info) => {
      setSysInfo(info);
      setExportPath(info.default_export_path || "");
    }).catch(() => {}).finally(() => setSysLoading(false));
  }, []);

  const handleClearProjects = async () => {
    if (clearInput !== "DELETE") return;
    setClearing(true);
    try {
      const result = await settings.clearAllProjects();
      import("sonner").then(({ toast }) => toast.success(t("settings.dangerCleared")));
      setClearInput("");
      setSysInfo(null);
      setSysLoading(true);
      settings.systemInfo().then(setSysInfo).catch(() => {}).finally(() => setSysLoading(false));
    } catch {
      import("sonner").then(({ toast }) => toast.error(t("settings.dangerClearFailed")));
    } finally {
      setClearing(false);
    }
  };

  const handleResetEnv = async () => {
    if (resetInput !== "RESET") return;
    setResetting(true);
    try {
      await settings.resetEnv();
      import("sonner").then(({ toast }) => toast.success(t("settings.dangerReset")));
      setResetInput("");
    } catch {
      import("sonner").then(({ toast }) => toast.error(t("settings.dangerResetFailed")));
    } finally {
      setResetting(false);
    }
  };

  const handleSaveExportPath = async () => {
    setExportPathSaving(true);
    try {
      await settings.updateDefaultExportPath(exportPath.trim());
      import("sonner").then(({ toast }) => toast.success(t("settings.saved")));
      setExportPathDirty(false);
    } catch {
      import("sonner").then(({ toast }) => toast.error(t("settings.saveFailed")));
    } finally {
      setExportPathSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* System info */}
      <div>
        <h2 className="text-base font-semibold mb-3">{t("settings.sysTitle")}</h2>
        <div className="border rounded-lg divide-y text-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground">{t("settings.sysPython")}</span>
            <span className="font-mono">{sysLoading ? t("settings.sysLoading") : (sysInfo?.python_version || "—")}</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("settings.sysDefaultExportPath")}</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={exportPath}
                onChange={(e) => { setExportPath(e.target.value); setExportPathDirty(true); }}
                placeholder={t("settings.sysExportPathPlaceholder")}
                className="flex-1 h-8 text-xs font-mono"
                spellCheck={false}
              />
              <Button
                size="sm"
                className="h-8"
                onClick={handleSaveExportPath}
                disabled={!exportPathDirty || exportPathSaving}
              >
                {exportPathSaving ? <Loader2 className="size-3.5 animate-spin" /> : t("settings.save")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("settings.sysExportPathHint")}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground">{t("settings.sysDiskUsage")}</span>
            <span className="font-mono">{sysLoading ? t("settings.sysLoading") : (sysInfo?.disk_usage_human || "—")}</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" /> {t("settings.dangerTitle")}
        </h2>
        <div className="border border-destructive/30 rounded-lg divide-y">
          {/* Clear all projects */}
          <div className="px-4 py-4 space-y-3">
            <div>
              <p className="text-sm font-medium">{t("settings.dangerClearProjects")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.dangerClearProjectsDesc")}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={clearInput}
                onChange={(e) => setClearInput(e.target.value)}
                placeholder={t("settings.dangerClearProjectsConfirm")}
                className="flex-1 h-8 rounded-md border border-input bg-transparent px-3 text-xs font-mono shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearProjects}
                disabled={clearInput !== "DELETE" || clearing}
              >
                {clearing ? <Loader2 className="size-3.5 animate-spin" /> : t("settings.dangerClearProjects")}
              </Button>
            </div>
          </div>

          {/* Reset env */}
          <div className="px-4 py-4 space-y-3">
            <div>
              <p className="text-sm font-medium">{t("settings.dangerResetEnv")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.dangerResetEnvDesc")}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder={t("settings.dangerResetConfirm")}
                className="flex-1 h-8 rounded-md border border-input bg-transparent px-3 text-xs font-mono shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetEnv}
                disabled={resetInput !== "RESET" || resetting}
              >
                {resetting ? <Loader2 className="size-3.5 animate-spin" /> : t("settings.dangerResetEnv")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
