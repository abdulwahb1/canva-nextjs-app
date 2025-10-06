"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<{ id: string; title: string }[]>(
    []
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [useCustomId, setUseCustomId] = useState<boolean>(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [out, setOut] = useState<any>(null);
  const [status, setStatus] = useState("");

  const connect = () => (window.location.href = "/api/auth/canva");

  const submit = async (e: any) => {
    e.preventDefault();
    setStatus("Working...");
    setOut(null);
    const brandTemplateId = useCustomId
      ? templateId
      : selectedTemplateId || templateId;
    const res = await fetch("/api/canva/autofill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: brandTemplateId,
        title,
        description: desc,
      }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Done" : "Error");
    setOut(data);
  };

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch("/api/canva/templates");
        if (!res.ok) throw new Error("Failed to fetch templates");
        const data = await res.json();
        if (data?.items?.length) {
          setTemplates(data.items);
          setSelectedTemplateId(data.items[0].id);
        } else {
          setUseCustomId(true);
        }
      } catch (err: any) {
        // Keep UI functional for manual entry
        console.error("Load templates failed", err?.message || err);
        setUseCustomId(true);
      }
    };
    loadTemplates();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6 font-sans">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Canva Autofill Demo
        </h1>
        <button
          onClick={connect}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          🔐 Connect Canva
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur-sm">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Template</label>
              <div className="flex gap-2">
                <select
                  className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  value={useCustomId ? "__custom__" : selectedTemplateId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__custom__") {
                      setUseCustomId(true);
                    } else {
                      setUseCustomId(false);
                      setSelectedTemplateId(val);
                    }
                  }}
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                  <option value="__custom__">Custom template ID…</option>
                </select>
              </div>
            </div>

            {useCustomId && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Template ID
                </label>
                <input
                  className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  placeholder="e.g. CANVA-TEMPLATE-ID"
                  required
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your design title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="min-h-24 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short description for the design"
              required
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              🎨 Generate
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 space-y-4">
        <div className="text-sm text-white/70">{status}</div>
        <pre className="max-h-80 overflow-auto rounded-md bg-black/70 p-4 text-xs text-green-300">
          {out ? JSON.stringify(out, null, 2) : null}
        </pre>

        {out?.design_url && (
          <a
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
            href={out.design_url}
            target="_blank"
          >
            Open Canva Design ↗
          </a>
        )}

        {out?.thumbnail_url && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <Image alt="generated-image" src={out.thumbnail_url} width={320} />
          </div>
        )}

        {out?.cloudinary_url && (
          <div>
            <a
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              href={out.cloudinary_url}
              target="_blank"
            >
              Open Cloudinary Image ↗
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
