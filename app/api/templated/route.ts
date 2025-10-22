import { NextResponse } from "next/server";

// Testing-only endpoint: proxies a render request to templated.io using the
// provided cURL details. The Canva implementation remains in the codebase but
// the frontend will call this route for now.
export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "title and description required" },
        { status: 400 }
      );
    }

    const body = {
      template: "f8b6e5db-c207-4f85-b0cb-810cc7b47b42",
      format: "jpg",
      layers: {
        "text-1": {
          text: title || "Add a heading",
          color: "rgba(0,0,0, 1)",
        },
        "text-2": {
          text: description || "Add a heading",
          color: "rgba(0,0,0, 1)",
        },
      },
    } as const;

    const response = await fetch("https://api.templated.io/v1/render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // NOTE: Testing key provided by user for this task only
        Authorization: "Bearer 5f253f38-9770-40a7-8d87-0efba0920b6a",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data || "templated.io error" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, result: data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
