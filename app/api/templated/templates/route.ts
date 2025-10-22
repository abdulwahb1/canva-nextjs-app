import { NextResponse } from "next/server";

// Lists templates from templated.io. Proxies optional query params from the request.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams();

    // Allow passing through known query params if provided
    const allowed = [
      "query",
      "page",
      "limit",
      "width",
      "height",
      "tags",
      "externalId",
      "includeLayers",
      "includePages",
    ];

    for (const key of allowed) {
      const value = url.searchParams.get(key);
      if (value !== null && value !== undefined && value !== "") {
        searchParams.set(key, value);
      }
    }

    const upstreamUrl = `https://api.templated.io/v1/templates${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.TEMPLATED_KEY}`,
      },
      // No body for GET
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data || "templated.io error" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, items: data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
