import { NextResponse } from "next/server";
import axios from "axios";
import { getValidToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = await getValidToken();

    const res = await axios.get(
      "https://api.canva.com/rest/v1/brand-templates",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Only return what the frontend needs: id and title
    const items = (res.data?.items || []).map((t: any) => ({
      id: t.id,
      title: t.title,
    }));

    return NextResponse.json({ success: true, items });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.response?.data || e.message },
      { status: 500 }
    );
  }
}
