"use client";
import Image from "next/image";
import { useState } from "react";

export default function Page() {
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [out, setOut] = useState<any>(null);
  const [status, setStatus] = useState("");

  const connect = () => (window.location.href = "/api/auth/canva");

  const submit = async (e: any) => {
    e.preventDefault();
    setStatus("Working...");
    setOut(null);
    const res = await fetch("/api/canva/autofill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: templateId,
        title,
        description: desc,
      }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Done" : "Error");
    setOut(data);
  };

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "24px auto",
        padding: 16,
        fontFamily: "sans-serif",
      }}
    >
      <h1>Canva Autofill Demo</h1>
      <button onClick={connect}>🔐 Connect Canva</button>
      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <label>Template ID</label>
        <input
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          required
        />
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label>Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <button type="submit" style={{ marginTop: 12 }}>
          🎨 Generate
        </button>
      </form>
      <div style={{ marginTop: 24 }}>
        <div>{status}</div>
        <pre>{out ? JSON.stringify(out, null, 2) : null}</pre>
        {out?.design_url && (
          <a href={out.design_url} target="_blank">
            Open Canva Design
          </a>
        )}
        {out?.thumbnail_url && (
          <div>
            <Image alt="generated-image" src={out.thumbnail_url} width={320} />
          </div>
        )}
        {out?.cloudinary_url && (
          <div>
            <a href={out.cloudinary_url} target="_blank">
              Open Cloudinary Image
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
